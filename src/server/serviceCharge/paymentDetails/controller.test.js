import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckGetMock,
  wreckPostMock
} from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'

const toCookieHeader = (setCookies = []) =>
  setCookies.map((cookie) => cookie.split(';')[0]).join('; ')

describe('#paymentDetailsController', () => {
  let server
  let credentials

  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'org-1'
    wreckGetMock.mockReset()
    wreckPostMock.mockReset()
  })

  test('renders payment confirmation page and marks account paid on return', async () => {
    wreckPostMock.mockReturnValue({
      res: { statusCode: statusCodes.ok },
      payload: {
        message: 'success',
        payment: {
          organisationId: 'orgid',
          paymentId: 'pid_123',
          amount: 2600,
          description: 'Annual report receipt of waste service charge',
          govPayLinks: {
            next_url: {
              href: 'https://www.payments.service.gov.uk/secure/abc123'
            }
          },
          metadata: {
            organisationId: 'orgid',
            servicePeriodStart: '2026-05-08T12:32:05.629Z',
            servicePeriodEnd: '2027-10-31T00:00:00.000Z'
          },
          reference: 'WASTE-34D30C7B',
          returnUrl: 'http://localhost:3000/payment-details',
          servicePeriodEnd: '2027-10-31T00:00:00.000Z',
          servicePeriodStart: '2026-05-08T12:32:05.629Z',
          status: 'payment_in_progress',
          version: 1
        }
      }
    })

    wreckGetMock.mockImplementation((url) => {
      if (url.includes('/payments/')) {
        return {
          res: { statusCode: statusCodes.ok },
          payload: {
            state: { status: 'success' },
            amount: 2600,
            reference: 'HDJ2123F'
          }
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

    const sessionCookie = toCookieHeader(
      initiatePaymentResponse.headers['set-cookie']
    )

    const { statusCode, payload, headers } = await server.inject({
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

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toEqual(expect.stringContaining('Payment confirmation'))
    expect(payload).toEqual(expect.stringContaining('HDJ2123F'))
    expect(payload).toEqual(expect.stringContaining('£26.00'))
    expect(payload).toEqual(
      expect.stringContaining('Report receipt of waste annual service charge')
    )

    const accountCookie = toCookieHeader(headers['set-cookie'])

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

    expect(accountResponse.payload).toEqual(expect.stringContaining('Paid'))
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
