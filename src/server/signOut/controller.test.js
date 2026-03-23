import { statusCodes } from '../common/constants/status-codes.js'
import { paths } from '../../config/paths.js'
import { config } from '../../config/config.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import {
  setupAuthedUserSession,
  getSessionCookie
} from '../../test-utils/session-helper.js'

describe('#signOutController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should clear session and render sign-out form', async () => {
    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const appBaseUrl = config.get('appBaseUrl')
    const expectedPostLogoutRedirectUri = `${appBaseUrl}${paths.signedOut}`

    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('You are being signed out'))
    expect(result).toEqual(
      expect.stringContaining(`action="${credentials.logoutUrl}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(
        `name="post_logout_redirect_uri" value="${expectedPostLogoutRedirectUri}"`
      )
    )
    expect(result).toEqual(expect.stringContaining('name="id_token_hint"'))

    const setCookie = headers['set-cookie']
    expect(setCookie).toBeDefined()
    expect(setCookie).toEqual(
      expect.arrayContaining([expect.stringContaining('userSession=;')])
    )

    const cachedSession = await server.app.cache.get(credentials.sessionId)
    expect(cachedSession).toBeNull()
  })

  test('Should use GET method when using the Defra ID stub', async () => {
    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const { result } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(result).toEqual(expect.stringContaining('method="get"'))
    expect(result).toEqual(expect.stringContaining('data-logout-method="get"'))
  })

  test('Should use POST method when using real Defra ID', async () => {
    const originalGet = config.get.bind(config)
    vi.spyOn(config, 'get').mockImplementation((key) => {
      if (key === 'auth.defraId.oidcConfigurationUrl') {
        return 'https://real-defra-id.gov.uk/.well-known/openid-configuration'
      }
      return originalGet(key)
    })

    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const { result } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(result).toEqual(expect.stringContaining('method="post"'))
    expect(result).toEqual(expect.stringContaining('data-logout-method="post"'))

    vi.restoreAllMocks()
  })

  test('Should include the id token hint from the session', async () => {
    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const { result } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(result).toEqual(
      expect.stringContaining(
        `name="id_token_hint" value="${credentials.idToken}"`
      )
    )
  })

  test('Should include a noscript fallback submit button', async () => {
    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const { result } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="sign-out-fallback-button"')
    )
    expect(result).toEqual(expect.stringContaining('type="submit"'))
  })
})
