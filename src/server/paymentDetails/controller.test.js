import { paths } from '../../config/paths.js'
import { config } from '../../config/config.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckGetMock,
  wreckPostMock
} from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const toCookieHeader = (setCookies = []) =>
  setCookies.map((cookie) => cookie.split(';')[0]).join('; ')

describe('#paymentDetailsController', () => {
  let server
  let credentials

  beforeAll(async () => {
    config.set('featureFlags.accountPage', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.accountPage', false)
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    wreckGetMock.mockReset()
    wreckPostMock.mockReset()
  })

  test('redirects to account and flashes success when payment status is success', async () => {
    wreckPostMock.mockReturnValue({
      res: { statusCode: statusCodes.ok },
      payload: {
        payment_id: 'pid_123',
        _links: {
          next_url: {
            href: 'https://www.payments.service.gov.uk/secure/abc123'
          }
        }
      }
    })

    wreckGetMock.mockImplementation((url) => {
      if (url.includes('/v1/payments/')) {
        return {
          res: { statusCode: statusCodes.ok },
          payload: { state: { status: 'success' } }
        }
      }

      return {
        payload: {
          issuer: 'http://localhost/path',
          authorization_endpoint: 'http://localhost/path',
          token_endpoint: 'http://localhost/path',
          end_session_endpoint: 'http://localhost/path',
          jwks_uri: 'http://localhost/path'
        }
      }
    })

    const initiatePaymentResponse = await server.inject({
      method: 'GET',
      url: paths.initiatePayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const sessionCookie = toCookieHeader(initiatePaymentResponse.headers['set-cookie'])

    const paymentDetailsResponse = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      headers: {
        cookie: sessionCookie
      },
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { statusCode, headers } = paymentDetailsResponse
    const accountCookie = toCookieHeader(paymentDetailsResponse.headers['set-cookie'])

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.account)

    const accountResponse = await server.inject({
      method: 'GET',
      url: paths.account,
      headers: {
        cookie: accountCookie
      },
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(accountResponse.payload).toEqual(
      expect.stringContaining('Paid')
    )
    expect(accountResponse.payload).toEqual(
      expect.stringContaining('Next payment due October 2027')
    )
  })

  test('redirects to account with no flash when payment id is missing', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.account)
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
