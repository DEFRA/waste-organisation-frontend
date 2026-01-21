import hapi from '@hapi/hapi'
import Bell from '@hapi/bell'
import { config } from '../../../../config/config.js'
import { openId } from './open-id.js'
import { expect } from 'vitest'
import { paths } from '../../../../config/paths.js'

const BASE_URL = 'http://example.com'

const SESSION_COOKIE_PASSWORD = 'Password1!'

const AUTH_DEFRA_CLIENTID = 'defraClientId'
const AUTH_DEFRA_CLIENTSECRET = 'defraClientSecret'
const AUTH_DEFRA_SERVICEID = 'defraClientSecret'
const AUTH_DEFRA_RESPONSE_TYPE = 'code'

const AUTH_ENTRA_CLIENTID = 'entraClientId'
const AUTH_ENTRA_CLIENTSECRET = 'entraClientSecret'

vi.mock('../../helpers/auth/open-id-client.js', () => ({
  getOpenIdConfig: vi.fn().mockReturnValue({
    authorization_endpoint: 'http://some-auth-endpoint/path',
    token_endpoint: 'http://some-token-endpoint/path',
    end_session_endpoint: 'http://some-end-session-endpoint/path'
  })
}))

vi.mock('../../helpers/auth/open-id-provider.js', () => ({
  openIdProvider: vi.fn((name, _) => ({
    name,
    auth: 'http://some-auth-endpoint/path',
    token: 'http://some-token-endpoint/path'
  }))
}))

const makeServer = async (strategyName) => {
  const server = hapi.server()

  await server.register(Bell)

  const strategySpy = vi.spyOn(server.auth, 'strategy')

  config.set('appBaseUrl', BASE_URL)

  config.set('session.cookie.password', SESSION_COOKIE_PASSWORD)
  config.set('session.cookie.secure', true)
  config.set('auth.defraId.clientId', AUTH_DEFRA_CLIENTID)
  config.set('auth.defraId.clientSecret', AUTH_DEFRA_CLIENTSECRET)
  config.set('auth.defraId.serviceId', AUTH_DEFRA_SERVICEID)
  config.set('auth.defraId.responseType', AUTH_DEFRA_RESPONSE_TYPE)

  config.set('auth.entraId.clientId', AUTH_ENTRA_CLIENTID)
  config.set('auth.entraId.clientSecret', AUTH_ENTRA_CLIENTSECRET)

  await openId.plugin.register(server)

  const call = strategySpy.mock.calls.find(([name]) => name === strategyName)

  const [name, strategyScheme, strategyOptions] = call

  return {
    server,
    name,
    strategyScheme,
    strategyOptions
  }
}

test('setup defraId strategy correctly', async () => {
  const strategyName = 'defraId'
  const { server, name, strategyScheme, strategyOptions } =
    await makeServer(strategyName)

  expect(name).toBe(strategyName)
  expect(strategyScheme).toBe('bell')
  expect(openId.plugin.name).toBe('open-id')
  expect(strategyOptions.location()).toEqual(
    `${BASE_URL}${paths.signinDefraIdCallback}`
  )
  expect(strategyOptions).toEqual(
    expect.objectContaining({
      provider: {
        name: strategyName,
        auth: 'http://some-auth-endpoint/path',
        token: 'http://some-token-endpoint/path'
      },
      password: SESSION_COOKIE_PASSWORD,
      clientId: AUTH_DEFRA_CLIENTID,
      clientSecret: AUTH_DEFRA_CLIENTSECRET,
      isSecure: true,
      providerParams: {
        serviceId: AUTH_DEFRA_SERVICEID,
        response_type: AUTH_DEFRA_RESPONSE_TYPE,
        forceReselection: true
      }
    })
  )

  server.stop()
})
