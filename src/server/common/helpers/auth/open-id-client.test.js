import wreck from '@hapi/wreck'
import { expect, vi } from 'vitest'
import { getOpenIdConfig, getOpenIdRefreshToken } from './open-id-client.js'

const oidcConfigUrl = 'https://some-oidc-configuration-endpoint'
const oidcRefreshUrl = 'https://some-token-refresh-endpoint'

const mockPost = vi.fn()

vi.mock('@hapi/wreck', () => ({
  default: {
    get: vi.fn().mockReturnValue({
      payload: {
        url: 'example.com'
      }
    }),
    post: (...args) => mockPost(...args)
  }
}))

vi.mock('../logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

describe('#openIdClient', () => {
  describe('#getOpenIdConfig', () => {
    test('Should call wreck get', async () => {
      const payload = await getOpenIdConfig(oidcConfigUrl)

      expect(wreck.get).toHaveBeenCalledWith(
        oidcConfigUrl,
        expect.objectContaining({
          json: 'strict'
        })
      )

      expect(payload).toEqual({
        url: 'example.com'
      })
    })
  })

  describe('#getOpenIdRefreshToken', () => {
    test('Should return ok response', async () => {
      mockPost.mockReturnValue({
        res: {
          statusCode: 200
        },
        payload:
          '{ "access_token": "FOO", "expires_in": 1000, "id_token": "FOO", "refresh_token": "FOO" }'
      })

      const params = {
        client_id: 'some-client-id',
        client_secret: 'some-client-secret',
        grant_type: 'refresh_token',
        refresh_token: 'some-refresh-token',
        scope: 'some-client-id openid',
        redirect_uri: 'http://some-uri'
      }

      const result = await getOpenIdRefreshToken(oidcRefreshUrl, params)

      expect(mockPost).toHaveBeenCalledWith(
        oidcRefreshUrl,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
          },
          payload:
            'client_id=some-client-id&client_secret=some-client-secret&grant_type=refresh_token&refresh_token=some-refresh-token&scope=some-client-id%20openid&redirect_uri=http%3A%2F%2Fsome-uri'
        })
      )
      expect(result.ok).toBeTruthy()
      expect(result.json).toEqual(
        expect.objectContaining({
          access_token: 'FOO'
        })
      )
    })

    test('Should return not ok response', async () => {
      mockPost.mockReturnValue({
        res: {
          statusCode: 500
        }
      })

      const params = {
        client_id: 'some-client-id',
        client_secret: 'some-client-secret',
        grant_type: 'refresh_token',
        refresh_token: 'some-refresh-token',
        scope: 'some-client-id openid',
        redirect_uri: 'http://some-uri'
      }

      const result = await getOpenIdRefreshToken(oidcRefreshUrl, params)

      expect(mockPost).toHaveBeenCalledWith(
        oidcRefreshUrl,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
          },
          payload:
            'client_id=some-client-id&client_secret=some-client-secret&grant_type=refresh_token&refresh_token=some-refresh-token&scope=some-client-id%20openid&redirect_uri=http%3A%2F%2Fsome-uri'
        })
      )
      expect(result.ok).toBeFalsy()
      expect(result).toEqual(
        expect.not.objectContaining({
          json: expect.anything()
        })
      )
    })
  })

  describe('When refresh response does not contain valid JSON payload', () => {
    test.each([
      { refreshPayload: null },
      { refreshPayload: 'FOO' },
      { refreshPayload: '{}' },
      { refreshPayload: '{ "access_token": "some-token" }' },
      { refreshPayload: '{ "access_token": "FOO", "expires_in": 1000 }' },
      {
        refreshPayload:
          '{ "access_token": "FOO", "expires_in": 1000, "id_token": "FOO" }'
      }
    ])('Should return not ok response', async ({ refreshPayload }) => {
      mockPost.mockReturnValue({
        res: {
          statusCode: 200
        },
        payload: refreshPayload
      })

      const params = {
        client_id: 'some-client-id',
        client_secret: 'some-client-secret',
        grant_type: 'refresh_token',
        refresh_token: 'some-refresh-token',
        scope: 'some-client-id openid',
        redirect_uri: 'http://some-uri'
      }

      const result = await getOpenIdRefreshToken(oidcRefreshUrl, params)

      expect(mockPost).toHaveBeenCalledWith(
        oidcRefreshUrl,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
          },
          payload:
            'client_id=some-client-id&client_secret=some-client-secret&grant_type=refresh_token&refresh_token=some-refresh-token&scope=some-client-id%20openid&redirect_uri=http%3A%2F%2Fsome-uri'
        })
      )
      expect(result.ok).toBeFalsy()
      expect(result).toEqual(
        expect.not.objectContaining({
          json: expect.anything()
        })
      )
    })
  })
})
