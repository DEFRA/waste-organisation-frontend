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
    const expectedLogoutUrl = `${credentials.logoutUrl}?post_logout_redirect_uri=${appBaseUrl}${paths.signedOut}`

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      headers: {
        cookie
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Signing out'))
    expect(result).toEqual(
      expect.stringContaining(`data-logout-url="${expectedLogoutUrl}"`)
    )
  })

  test('Should return 401 when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.signOut
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
