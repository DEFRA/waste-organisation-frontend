import { describe, expect, test, vi, beforeEach } from 'vitest'

import { config } from '../../config/config.js'
import { paymentDetailsController } from './controller.js'
import { paths } from '../../config/paths.js'

const mockGetGovPayPaymentStatus = vi.fn()

vi.mock('../common/helpers/govpay/create-payment.js', () => ({
  getGovPayPaymentStatus: (...args) => mockGetGovPayPaymentStatus(...args)
}))

const createRequest = (overrides = {}) => ({
  yar: {
    get: vi.fn().mockReturnValue('pid_123'),
    flash: vi.fn(),
    clear: vi.fn()
  },
  auth: {
    credentials: {
      id: 'user-1',
      currentOrganisationId: 'org-2',
      currentOrganisationName: '  Example Organisation  ',
      currentRelationshipId: 1,
      relationships: ['1:org-2:Relationship Org:0:0:0:0']
    }
  },
  backendApi: {
    getOrganisations: vi.fn().mockResolvedValue([
      { id: 'org-1', name: 'First Org' },
      { id: 'org-2', name: 'Second Org' }
    ])
  },
  logger: {
    error: vi.fn()
  },
  ...overrides
})

const createH = () => ({
  redirect: vi.fn((location) => ({ location })),
  view: vi.fn((template, context) => ({ template, context }))
})

describe('#paymentDetailsControllerUnit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.set('featureFlags.serviceCharge', true)
  })

  test('redirects to account when payment id is missing', async () => {
    const request = createRequest({
      yar: {
        get: vi.fn().mockReturnValue(undefined),
        flash: vi.fn(),
        clear: vi.fn()
      }
    })
    const h = createH()

    const result = await paymentDetailsController.handler(request, h)

    expect(h.redirect).toHaveBeenCalledWith(paths.account)
    expect(result).toEqual({ location: paths.account })
  })

  test('logs and still renders when GovPay status lookup throws', async () => {
    mockGetGovPayPaymentStatus.mockRejectedValue(new Error('network down'))

    const request = createRequest({
      auth: {
        credentials: {
          id: 'user-1',
          currentOrganisationId: 'org-2',
          currentOrganisationName: '1',
          currentRelationshipId: 1,
          relationships: ['1:org-2:12345:0:0:0:0']
        }
      },
      backendApi: {
        getOrganisations: vi.fn().mockResolvedValue([])
      }
    })
    const h = createH()

    const result = await paymentDetailsController.handler(request, h)

    expect(request.logger.error).toHaveBeenCalledWith(
      'Failed to fetch GovPay payment status: network down'
    )
    expect(request.yar.clear).toHaveBeenCalledWith('govPayPaymentId')
    expect(result.context.paymentReference).toBe('')
  })
})
