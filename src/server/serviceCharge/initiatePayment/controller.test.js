import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckPostMock
} from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { expect, test, vi } from 'vitest'
import { initiatePaymentController } from './controller.js'

import { faker } from '@faker-js/faker'

const ORGANISATION_ID = 456
const ORGANISATION_NAME = 'Joe Bloggs Ltd'
const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'

describe('#initiatePaymentController', () => {
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
    wreckPostMock.mockReset()
  })

  test('initiate payment', async () => {
    const dateNow = new Date('2026-05-05T10:00:00.000Z')
    const mockNextUrl = faker.internet.url
    const { backendMock, request, h } = createMockRequest(
      ORGANISATION_ID,
      ORGANISATION_NAME,
      dateNow,
      mockNextUrl
    )
    const { serviceChargeAmountPence } = config.get('govPay')
    const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')

    await initiatePaymentController.handler(request, h)

    expect(backendMock).toBeCalledWith(ORGANISATION_ID, {
      amount: serviceChargeAmountPence,
      description: SERVICE_CHARGE_DESCRIPTION,
      returnUrl: `${appBaseUrl}${paths.paymentDetails}`,
      metadata: {
        organisationId: ORGANISATION_ID,
        organisationName: ORGANISATION_NAME,
        servicePeriodStart: dateNow,
        servicePeriodEnd: new Date('2027-10-31')
      }
    })

    expect(h.redirect).toBeCalledWith(mockNextUrl)
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

const createMockRequest = (
  organisationId,
  organisationName,
  dateNow,
  nextUrl
) => {
  const backendMock = vi.fn()

  return {
    backendMock,
    request: {
      auth: {
        credentials: {
          currentOrganisationId: organisationId,
          currentOrganisatioName: organisationName
        }
      },
      backendApi: {
        initiatePayment: backendMock.mockReturnValue({
          payment: {
            paymentId: faker.string.uuid,
            govPayLinks: { next_url: { href: nextUrl } }
          }
        })
      },
      logger: {
        error: vi.fn()
      },
      yar: {
        set: vi.fn()
      },
      info: {
        received: dateNow.getTime()
      }
    },
    h: {
      redirect: vi.fn()
    }
  }
}
