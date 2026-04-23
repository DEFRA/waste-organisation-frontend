import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckPostMock
} from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { test } from 'vitest'

describe('#serviceChargeIndex', () => {
  let server
  let credentials

  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', false)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    wreckPostMock.mockReset()
  })

  test.each([
    paths.serviceCharge,
    paths.reviewPayment,
    paths.paymentDetails,
    paths.initiatePayment
  ])(
    'returns not found when service charge feature flag is disabled',
    async (url) => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.notFound)
    }
  )
})
