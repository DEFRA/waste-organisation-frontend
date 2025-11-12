import { createAuthedUser } from './utils/session-helper.js'
import { config } from '../../../../config/config.js'
import { getUserSession } from './user-session.js'

import { paths } from '../../../../config/paths.js'
import { refreshAccessToken } from './refresh-token.js'

const mockGetOpenIdRefreshToken = vi.fn()

const authConfig = config.get('auth')

vi.mock('./open-id-client.js', () => ({
  getOpenIdRefreshToken: (...args) => mockGetOpenIdRefreshToken(...args)
}))

vi.mock('./user-session.js', () => ({
  getUserSession: vi.fn()
}))

test('refreshes user signed in with DefraId', async () => {
  const authedUser = createAuthedUser()
  const clientId = authConfig.defraId.clientId
  const clientSecret = authConfig.defraId.clientSecret
  const redirectUri = config.get('appBaseUrl') + paths.SIGNIN_DEFRA_ID_CALLBACK

  getUserSession.mockReturnValue(authedUser)

  await refreshAccessToken({})

  expect(mockGetOpenIdRefreshToken.mock.calls).toEqual([
    [
      authedUser.tokenUrl,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: authedUser.refreshToken,
        scope: 'openid offline_access',
        redirect_uri: redirectUri
      }
    ]
  ])
})

test('refreshes user signed in with EntraId', async () => {
  const authedUser = createAuthedUser(null, 'entraId')
  const clientId = authConfig.entraId.clientId
  const clientSecret = authConfig.entraId.clientSecret
  const redirectUri = config.get('appBaseUrl') + paths.SIGNIN_ENTRA_ID_CALLBACK

  getUserSession.mockReturnValue(authedUser)

  await refreshAccessToken({})

  expect(mockGetOpenIdRefreshToken.mock.calls).toEqual([
    [
      authedUser.tokenUrl,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: authedUser.refreshToken,
        scope: 'openid offline_access',
        redirect_uri: redirectUri
      }
    ]
  ])
})

test('logs missing if refresh token missing', async () => {
  const { refreshToken, ...authedUser } = createAuthedUser()
  getUserSession.mockReturnValue(authedUser)
  const request = { logger: { error: vi.fn() } }
  const expected = await refreshAccessToken(request)

  expect(request.logger.error.mock.calls).toEqual([
    ['missing defraId refresh token scopes: openid offline_access']
  ])
  expect(expected).toEqual({})
})
