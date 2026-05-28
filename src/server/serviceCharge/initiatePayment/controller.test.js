import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckPostMock
} from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { afterEach, expect, test, vi } from 'vitest'
import { initiatePaymentController } from './controller.js'

import { faker } from '@faker-js/faker'

const ORGANISATION_ID = 456
const ORGANISATION_NAME = 'Joe Bloggs Ltd'
const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'
const MESSAGE_TYPE = 'payment-periods'

describe('#initiatePaymentController', () => {
  let server
  let credentials

  beforeEach(async () => {
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
    credentials = await setupAuthedUserSession(server)
    wreckPostMock.mockReset()
  })

  afterEach(async () => {
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  test('initiate payment', async () => {
    const serviceChargeAmountPence = 4000

    const dateNow = new Date('2026-05-05T10:00:00.000Z')
    const mockNextUrl = faker.internet.url
    const { backendMock, request, h } = createMockRequest(
      ORGANISATION_ID,
      ORGANISATION_NAME,
      dateNow,
      mockNextUrl,
      [
        {
          from: '2026-10-01T00:00:00.000Z',
          to: '2027-10-01T00:00:00.000Z',
          priceInPence: serviceChargeAmountPence
        }
      ]
    )

    const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')
    await initiatePaymentController.handler(request, h)

    expect(backendMock).toBeCalledWith(ORGANISATION_ID, {
      amount: serviceChargeAmountPence,
      description: SERVICE_CHARGE_DESCRIPTION,
      returnUrl: `${appBaseUrl}${paths.paymentDetails}`,
      metadata: {
        organisationId: ORGANISATION_ID,
        organisationName: ORGANISATION_NAME,
        servicePeriodStart: '2026-10-01T00:00:00.000Z',
        servicePeriodEnd: '2027-10-01T00:00:00.000Z'
      }
    })

    expect(h.redirect).toBeCalledWith(mockNextUrl)
  })

  test('returns bad gateway if GovPay payment creation fails', async () => {
    server.injectYarState({
      type: MESSAGE_TYPE,
      message: [
        {
          from: '2026-10-01T00:00:00.000Z',
          to: '2027-10-01T00:00:00.000Z',
          priceInPence: 4000
        }
      ]
    })
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

  test('redirect to cannotMakePayment when no payments are avalible', async (paymentPeriods) => {
    server.injectYarState({ type: MESSAGE_TYPE, message: [] })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.initiatePayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.cannotMakePayment)
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
  nextUrl,
  paymentPeriods
) => {
  const backendMock = vi.fn()

  return {
    backendMock,
    request: {
      auth: {
        credentials: {
          currentOrganisationId: organisationId,
          currentOrganisationName: organisationName
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
        set: vi.fn(),
        flash: vi.fn().mockReturnValue(paymentPeriods)
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
