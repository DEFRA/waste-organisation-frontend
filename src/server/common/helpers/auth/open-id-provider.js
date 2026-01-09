import jwt from '@hapi/jwt'
import { getOpenIdConfig } from './open-id-client.js'
import { config } from '../../../../config/config.js'
import { checkGroups } from './check-groups.js'
import { createLogger } from '../logging/logger.js'

const logger = createLogger()

const setOrigins = (providerEndpoints) => {
  const { origins } = config.get('auth')

  const newOrigins = providerEndpoints.filter(Boolean).map((endpoint) => {
    const { origin } = new URL(endpoint)
    return origin
  })

  const updatedOrigins = [...new Set([...origins, ...newOrigins])]

  config.set('auth.origins', updatedOrigins)
}

export const openIdProvider = async (name, authConfig) => {
  const oidcConf = await getOpenIdConfig(authConfig.oidcConfigurationUrl)

  const providerEndpoints = [
    authConfig.oidcConfigurationUrl,
    oidcConf.authorization_endpoint,
    oidcConf.token_endpoint,
    oidcConf.end_session_endpoint
  ]
  setOrigins(providerEndpoints)

  return {
    name,
    protocol: 'oauth2',
    useParamsAuth: true,
    auth: oidcConf.authorization_endpoint,
    token: oidcConf.token_endpoint,
    pkce: 'S256',
    scope: authConfig.scopes,
    profile: async (credentials, params, _get) => {
      logger.info(JSON.stringify(credentials) + ' - are JWT credentials found')
      logger.info(JSON.stringify(params) + ' - are params found')
      logger.info(JSON.stringify(oidcConf) + ' - are oidcConf found')
      logger.info(JSON.stringify(authConfig) + ' - are authConfig found')
      logger.info(
        JSON.stringify(config.get('auth.origins')) + ' - are auth.origins found'
      )

      if (!credentials?.token) {
        throw new Error(
          `${name} Auth Access Token not present. Unable to retrieve profile.`
        )
      }

      const payload = jwt.token.decode(credentials.token).decoded.payload

      if (credentials.provider === 'entraId') {
        const { groups = [] } = jwt.token.decode(params.id_token).decoded
          .payload
        checkGroups(groups)
      }

      const displayName = [payload.firstName, payload.lastName]
        .filter((part) => part)
        .join(' ')

      // eslint-disable-next-line no-unused-vars
      const [_, currentOrganisationId, currentOrganisationName] =
        payload.relationships
          .filter((r) => r.startsWith(payload.currentRelationshipId + ':'))[0]
          ?.match(/[^:]*:([^:]*):(.*)[^:]*:[^:]*:[^:]*:[^:]*/)

      credentials.profile = {
        id: payload.sub,
        correlationId: payload.correlationId,
        sessionId: payload.sessionId,
        contactId: payload.contactId,
        serviceId: payload.serviceId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        displayName,
        email: payload.email,
        uniqueReference: payload.uniqueReference,
        loa: payload.loa,
        aal: payload.aal,
        enrolmentCount: payload.enrolmentCount,
        enrolmentRequestCount: payload.enrolmentRequestCount,
        currentRelationshipId: payload.currentRelationshipId,
        currentOrganisationId,
        currentOrganisationName,
        relationships: payload.relationships,
        roles: payload.roles,
        idToken: params.id_token,
        tokenUrl: oidcConf.token_endpoint,
        logoutUrl: oidcConf.end_session_endpoint
      }
    }
  }
}
