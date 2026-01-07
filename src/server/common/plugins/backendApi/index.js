import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'
import { createLogger } from '../../helpers/logging/logger.js'

const logger = createLogger()

const { presharedKey } = config.get('backendApi')

const headers = {
  'x-auth-token': presharedKey
}

const remoteCall = (backendUrl, _presharedKey) => {
  return {
    getOrganisations: async (userId) => {
      try {
        const { payload } = await wreck.get(
          `${backendUrl}/user/${userId}/organisations`,
          {
            json: 'strict',
            headers
          }
        )
        return payload.organisations
      } catch (e) {
        logger.error('ERROR calling backend api', e)
        return null
      }
    },
    saveOrganisation: async (userId, organisationId, orgData) => {
      try {
        const { payload } = await wreck.put(
          `${backendUrl}/user/${userId}/organisation/${organisationId}`,
          {
            json: 'strict',
            payload: { organisation: orgData },
            headers
          }
        )
        return payload.organisations
      } catch (e) {
        logger.error('ERROR calling backend api', e)
        return null
      }
    }
  }
}

export const backendApi = {
  plugin: {
    name: 'backendApi',
    register: async (server) => {
      const { url, presharedKey } = config.get('backendApi')
      server.decorate('request', 'backendApi', remoteCall(url, presharedKey))
    }
  }
}
