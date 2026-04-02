import hapi from '@hapi/hapi'
import { statusCodes } from '../../constants/status-codes.js'
import { basicAuth } from './basic.js'
import { config } from '../../../../config/config.js'

const testRoute = {
  method: 'GET',
  path: '/test',
  handler: (_request, h) => h.response('ok').code(statusCodes.ok),
  options: { auth: false }
}

const makeServer = async () => {
  const server = hapi.server()
  await server.register(basicAuth)
  server.route(testRoute)
  await server.initialize()
  return server
}

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
      const server = await makeServer()

      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: '/test'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toBe('ok')

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
      const server = await makeServer()

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/test'
      })

      expect(statusCode).toBe(statusCodes.unauthorized)
      expect(headers['www-authenticate']).toBe(
        'Basic realm="Access restricted"'
      )

      await server.stop({ timeout: 0 })
    })

    test('requests with incorrect password get 401', async () => {
      const server = await makeServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          authorization: `Basic ${encodeCredentials(username, 'wrong-password')}`
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })

    test('requests with incorrect username get 401', async () => {
      const server = await makeServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          authorization: `Basic ${encodeCredentials('wrong-user', password)}`
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })

    test('requests with correct credentials get 200', async () => {
      const server = await makeServer()

      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          authorization: `Basic ${encodeCredentials(username, password)}`
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toBe('ok')

      await server.stop({ timeout: 0 })
    })

    test('requests with malformed Authorization header get 401', async () => {
      const server = await makeServer()

      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          authorization: 'Bearer some-token'
        }
      })

      expect(statusCode).toBe(statusCodes.unauthorized)

      await server.stop({ timeout: 0 })
    })
  })
})
