import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../constants/status-codes.js'
import {
  initialiseServer,
  wreckGetMock
} from '../../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../../test-utils/session-helper.js'
import { config } from '../../../../config/config.js'
import { faker } from '@faker-js/faker'

describe('#paymentCheck', () => {
  let server
  let initialServiceChargeFeatureFlag

  beforeAll(async () => {
    initialServiceChargeFeatureFlag = config.get('featureFlags.serviceCharge')
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
    config.set('featureFlags.serviceCharge', initialServiceChargeFeatureFlag)
    wreckGetMock.mockReset()
  })

  test('allows user access while service charge is disabled', async () => {
    config.set('featureFlags.serviceCharge', false)
    const credentials = await setupAuthedUserSession(server)

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.spreadsheetUpload,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).not.toBe(statusCodes.found)
  })

  test('redirects to account page when authed user has not paid', async () => {
    config.set('featureFlags.serviceCharge', true)
    const credentials = await setupAuthedUserSession(server)

    wreckGetMock.mockReturnValue({
      payload: {
        organisation: {
          organisationId: 'orgid',
          disableAfter: faker.date.past(),
          paymentPeriods: []
        }
      }
    })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.spreadsheetUpload,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.account)
  })

  test('allows access if user has paid', async () => {
    config.set('featureFlags.serviceCharge', true)
    const credentials = await setupAuthedUserSession(server)

    wreckGetMock.mockReturnValue({
      payload: {
        organisation: {
          organisationId: 'orgid',
          disableAfter: faker.date.future(),
          paymentPeriods: []
        }
      }
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.spreadsheetUpload,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).not.toBe(statusCodes.found)
  })
})
