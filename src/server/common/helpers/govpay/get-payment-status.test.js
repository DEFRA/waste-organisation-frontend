import wreck from '@hapi/wreck'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { config } from '../../../../config/config.js'
import { getGovPayPaymentStatus } from './get-payment-status.js'

vi.mock('@hapi/wreck', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('#getGovPayPaymentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.set('govPay.apiUrl', 'https://pay.example.test/v1/')
    config.set('govPay.apiKey', 'test-api-key')
  })

  test('returns status, amount and reference', async () => {
    wreck.get.mockResolvedValue({
      res: { statusCode: 200 },
      payload: {
        state: { status: 'success' },
        amount: 2600,
        reference: 'REF1234'
      }
    })

    const result = await getGovPayPaymentStatus('pid_123')

    expect(result).toEqual({
      status: 'success',
      amount: 2600,
      reference: 'REF1234'
    })

    expect(wreck.get).toHaveBeenCalledWith(
      'https://pay.example.test/v1/payments/pid_123',
      {
        json: 'strict',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json'
        }
      }
    )
  })

  test.each([
    {
      payload: { description: 'description message' },
      message: 'description message'
    },
    { payload: { message: 'message text' }, message: 'message text' },
    { payload: { detail: 'detail text' }, message: 'detail text' },
    { payload: {}, message: 'GovPay returned status 502' }
  ])(
    'throws useful reason for failed status: $message',
    async ({ payload, message }) => {
      wreck.get.mockResolvedValue({
        res: { statusCode: 502 },
        payload
      })

      await expect(getGovPayPaymentStatus('pid_123')).rejects.toThrow(message)
    }
  )
})
