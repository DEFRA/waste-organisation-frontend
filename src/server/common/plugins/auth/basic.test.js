import { statusCodes } from '../../constants/status-codes.js'
import { config } from '../../../../config/config.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'

const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`).toString('base64')

describe('#basicAuth', () => {
  const originalUsername = config.get('auth.basic.username')
  const originalPassword = config.get('auth.basic.password')

  afterEach(() => {
    config.set('auth.basic.username', originalUsername)
    config.set('auth.basic.password', originalPassword)
  })

  describe('when BASIC_AUTH_PASSWORD is not set', () => {
    test('requests pass through without basic auth', async () => {
      config.set('auth.basic.password', null)
      const server = await initialiseServer()

      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: '/health'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual({ message: 'success' })

      await server.stop({ timeout: 0 })
    })
  })

  describe('when BASIC_AUTH_PASSWORD is set', () => {
    const username = 'admin'
    const password = 'test-secret'

    beforeEach(() => {
      config.set('auth.basic.username', username)
      config.set('auth.basic.password', password)
    })

    test('requests without Authorization header get 401', async () => {
      const server = await initialiseServer()

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/health'
      })

      expect(statusCode).toBe(statusCodes.unauthorized)
      expect(headers['www-authenticate']).toBe(
        'Basic realm="Access restricted"'
      )

      await server.stop({ timeout: 0 })
    })

    test('requests to cdp uploader callback do not get 401', async () => {
      const preSharedKey = 'abc123'
      config.set('fileUpload.preSharedKey', preSharedKey)

      const server = await initialiseServer()

      const r1 = await server.inject({
        method: 'POST',
        url: '/organisation/organisationId-123/update-spreadsheet/upload-callback',
        payload: { metadata: { preSharedKey } }
      })

      expect(r1.statusCode).toBe(200)

      const { statusCode } = await server.inject({
        method: 'POST',
        url: '/organisation/organisationId-123/update-spreadsheet/upload-callback',
        payload: { metadata: { preSharedKey: 'bork' } }
      })

      expect(statusCode).toBe(403)
      await server.stop({ timeout: 0 })
    })

    test('requests with incorrect password get 401', async () => {
      const server = await initialiseServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/health',
        headers: {
          authorization: `Basic ${encodeCredentials(username, 'wrong-password')}`
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })

    test('requests with incorrect username get 401', async () => {
      const server = await initialiseServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/health',
        headers: {
          authorization: `Basic ${encodeCredentials('wrong-user', password)}`
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })

    test('requests with correct credentials get 200', async () => {
      const server = await initialiseServer()

      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: '/health',
        headers: {
          authorization: `Basic ${encodeCredentials(username, password)}`
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual({ message: 'success' })

      await server.stop({ timeout: 0 })
    })

    test('requests with malformed Authorization header get 401', async () => {
      const server = await initialiseServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/health',
        headers: {
          authorization: 'Bearer some-token'
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })
  })
})
