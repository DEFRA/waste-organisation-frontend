import { describe, expect, test, vi, beforeEach } from 'vitest'

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

  test('uses trimmed credentials organisation name and formats amount in pounds', async () => {
    mockGetGovPayPaymentStatus.mockResolvedValue({
      status: 'success',
      reference: 'REF123',
      amount: 2600
    })

    const request = createRequest()
    const h = createH()

    const result = await paymentDetailsController.handler(request, h)

    expect(mockGetGovPayPaymentStatus).toHaveBeenCalledWith('pid_123')
    expect(request.yar.flash).toHaveBeenCalledWith('paymentStatus', 'success')
    expect(request.backendApi.getOrganisations).not.toHaveBeenCalled()
    expect(result.context.paymentSummary.organisationValue).toBe(
      'Example Organisation'
    )
    expect(result.context.paymentSummary.totalAmountValue).toBe('£26.00')
  })

  test('falls back to placeholder when user id is missing and amount is not numeric', async () => {
    mockGetGovPayPaymentStatus.mockResolvedValue({
      status: 'failed',
      reference: 'REF123',
      amount: undefined
    })

    const request = createRequest({
      auth: {
        credentials: {
          id: undefined,
          currentOrganisationName: '',
          currentRelationshipId: 9,
          relationships: ['1:org-2:12345:0:0:0:0']
        }
      }
    })
    const h = createH()

    const result = await paymentDetailsController.handler(request, h)

    expect(request.backendApi.getOrganisations).not.toHaveBeenCalled()
    expect(result.context.paymentSummary.organisationValue).toBe(
      '[Waste receiving organisation or business name]'
    )
    expect(result.context.paymentSummary.totalAmountValue).toBe('£0.00')
    expect(request.yar.flash).not.toHaveBeenCalled()
  })

  test('falls back to first valid backend organisation when id match is not valid', async () => {
    mockGetGovPayPaymentStatus.mockResolvedValue({
      status: 'created',
      reference: 'REF123',
      amount: 100
    })

    const request = createRequest({
      auth: {
        credentials: {
          id: 'user-1',
          currentOrganisationId: 'org-99',
          currentOrganisationName: '1',
          currentRelationshipId: 3,
          relationships: ['1:org-1:12345:0:0:0:0']
        }
      },
      backendApi: {
        getOrganisations: vi.fn().mockResolvedValue([
          { id: 'org-1', name: 'Fallback Org Name' },
          { id: 'org-2', name: 'Another Org Name' }
        ])
      }
    })
    const h = createH()

    const result = await paymentDetailsController.handler(request, h)

    expect(request.backendApi.getOrganisations).toHaveBeenCalledWith('user-1')
    expect(result.context.paymentSummary.organisationValue).toBe(
      'Fallback Org Name'
    )
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
