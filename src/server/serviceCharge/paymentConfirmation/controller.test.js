import { config } from '../../../config/config'
import { paths } from '../../../config/paths.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { statusCodes } from '../../common/constants/status-codes.js'

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
  })

  test('renders payment confirmation page', async () => {
    server.setYarState({ type: 'govPayPaymentId', message: 'paymentID' })
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toEqual(expect.stringContaining('Payment confirmation'))
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
