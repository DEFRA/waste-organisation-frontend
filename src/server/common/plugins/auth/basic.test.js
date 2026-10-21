import crypto from 'crypto'
import { statusCodes } from '../../constants/status-codes.js'
import { config } from '../../../../config/config.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { JSDOM } from 'jsdom'
import { obscureKey } from './basic.js'

const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`).toString('base64')

describe('#basicAuth', () => {
  let server

  const originalUsername = config.get('auth.basic.username')
  const originalPassword = config.get('auth.basic.password')
  const originalServiceChargeFF = config.get('featureFlags.serviceCharge')

  beforeEach(() => {
    config.set('featureFlags.serviceCharge', true)
  })

  afterEach(() => {
    config.set('auth.basic.username', originalUsername)
    config.set('auth.basic.password', originalPassword)
    config.set('featureFlags.serviceCharge', originalServiceChargeFF)
  })

  describe('when BASIC_AUTH_PASSWORD is not set', () => {
    beforeEach(async () => {
      config.set('auth.basic.password', null)
      server = await initialiseServer()
    })

    afterEach(async () => {
      await server?.stop({ timeout: 0 })
    })

    test('requests pass through without basic auth', async () => {
      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: '/health'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual({ message: 'success' })
    })
  })

  describe('when BASIC_AUTH_PASSWORD is set', () => {
    const username = 'admin'
    const password = 'test-secret'

    describe('standard requests', () => {
      beforeEach(async () => {
        config.set('auth.basic.username', username)
        config.set('auth.basic.password', password)
        server = await initialiseServer()
      })

      afterEach(async () => {
        await server?.stop({ timeout: 0 })
      })

      test('requests without Authorization header get 401 and a login form', async () => {
        const { statusCode, payload } = await server.inject({
          method: 'GET',
          url: '/health'
        })

        expect(statusCode).toBe(statusCodes.unauthorized)
        const { document } = new JSDOM(payload).window
        const user = document.querySelector('input#username')
        expect(user).not.toBeNull()
        const password = document.querySelector('input#password')
        expect(password).not.toBeNull()
      })

      test('posting the login form sets a cookie', async () => {
        const loginPath = `/secret/${obscureKey}/login-url`
        const { statusCode, headers } = await server.inject({
          method: 'GET',
          url: `${loginPath}?username=${username}&password=${password}`
        })
        expect(statusCode).toBe(statusCodes.found)
        expect(headers['set-cookie'][0]).toContain(
          `env-login-c2472e5962be41f4a3afe1abd20b449b=${encodeCredentials(username, password)};`
        )
      })

      test('requests with incorrect password get 401', async () => {
        const { statusCode } = await server.inject({
          method: 'GET',
          url: '/health',
          headers: {
            authorization: `Basic ${encodeCredentials(username, 'wrong-password')}`
          }
        })

        expect(statusCode).toBe(statusCodes.unauthorized)
      })

      test('requests with incorrect username get 401', async () => {
        const { statusCode } = await server.inject({
          method: 'GET',
          url: '/health',
          headers: {
            authorization: `Basic ${encodeCredentials('wrong-user', password)}`
          }
        })

        expect(statusCode).toBe(statusCodes.unauthorized)
      })

      test('requests with correct credentials get 200', async () => {
        const { statusCode, result } = await server.inject({
          method: 'GET',
          url: '/health',
          headers: {
            authorization: `Basic ${encodeCredentials(username, password)}`
          }
        })

        expect(statusCode).toBe(statusCodes.ok)
        expect(result).toEqual({ message: 'success' })
      })

      test('requests with malformed Authorization header get 401', async () => {
        const { statusCode } = await server.inject({
          method: 'GET',
          url: '/health',
          headers: {
            authorization: 'Bearer some-token'
          }
        })

        expect(statusCode).toBe(statusCodes.unauthorized)
      })
    })

    describe('cdp uploader callback', () => {
      const preSharedKey = 'abc123'

      beforeEach(async () => {
        config.set('auth.basic.username', username)
        config.set('auth.basic.password', password)
        config.set('fileUpload.preSharedKey', preSharedKey)
        server = await initialiseServer()
      })

      afterEach(async () => {
        await server?.stop({ timeout: 0 })
      })

      test.each([
        '/organisation/organisationId-123/update-spreadsheet/upload-callback',
        '/organisation/organisationId-123/spreadsheet/upload-callback'
      ])('requests to cdp uploader callback do not get 401', async (url) => {
        const r1 = await server.inject({
          method: 'POST',
          url,
          payload: { metadata: { preSharedKey } }
        })

        expect(r1.statusCode).toBe(200)

        const { statusCode } = await server.inject({
          method: 'POST',
          url,
          payload: { metadata: { preSharedKey: 'bork' } }
        })

        expect(statusCode).toBe(403)
      })
    })

    describe('service charge callback', () => {
      const preSharedKey = 'abc123'

      beforeEach(async () => {
        config.set('auth.basic.username', username)
        config.set('auth.basic.password', password)
        config.set('govPay.webhookSigningSecret', preSharedKey)
        server = await initialiseServer()
      })

      afterEach(async () => {
        await server?.stop({ timeout: 0 })
      })

      test('requests from service charge callback do not get 401 for service-charge-callback', async () => {
        const url = paths.paymentCallback

        const signature = crypto
          .createHmac('sha256', preSharedKey)
          .update(JSON.stringify({ metadata: { preSharedKey } }))
          .digest('hex')

        const r1 = await server.inject({
          method: 'POST',
          url,
          headers: { 'pay-signature': signature },
          payload: JSON.stringify({ metadata: { preSharedKey } })
        })

        expect(r1.statusCode).toBe(200)

        const { statusCode } = await server.inject({
          method: 'POST',
          url,
          headers: { 'pay-signature': signature },
          payload: JSON.stringify({ metadata: { preSharedKey: 'bork' } })
        })

        expect(statusCode).toBe(403)
      })
    })
  })
})
