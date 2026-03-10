import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckPostMock
} from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#initiatePaymentController', () => {
  let server
  let credentials

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    wreckPostMock.mockReset()
  })

  test('redirects to GovPay next_url when payment is created', async () => {
    const govPayUrl = 'https://www.payments.service.gov.uk/secure/abc123'

    wreckPostMock.mockReturnValue({
      payload: {
        payment_id: 'pid_123',
        _links: {
          next_url: {
            href: govPayUrl
          }
        }
      }
    })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.initiatePayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(govPayUrl)
    expect(wreckPostMock).toHaveBeenCalledTimes(1)
  })

  test('returns bad gateway if GovPay payment creation fails', async () => {
    wreckPostMock.mockImplementation(async () => {
      throw new Error('GovPay unavailable')
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.initiatePayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(502)
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.initiatePayment
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
