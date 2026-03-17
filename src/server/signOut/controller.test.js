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

  test('Should clear session and render signing out page with logout URL', async () => {
    const credentials = await setupAuthedUserSession(server)
    const cookie = await getSessionCookie(credentials.sessionId)

    const appBaseUrl = config.get('appBaseUrl')
    const expectedUrl = new URL(credentials.logoutUrl)
    expectedUrl.searchParams.set(
      'post_logout_redirect_uri',
      `${appBaseUrl}${paths.signedOut}`
    )
    const expectedLogoutUrl = expectedUrl.toString()

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
      expect.stringContaining(`data-logout-url="${expectedLogoutUrl}"`)
    )

    const setCookie = headers['set-cookie']
    expect(setCookie).toBeDefined()
    expect(setCookie).toEqual(
      expect.arrayContaining([expect.stringContaining('userSession=;')])
    )

    const cachedSession = await server.app.cache.get(credentials.sessionId)
    expect(cachedSession).toBeNull()
  })

  test('Should return 401 when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.signOut
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
