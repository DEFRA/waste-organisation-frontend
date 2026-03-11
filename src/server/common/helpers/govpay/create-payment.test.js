import wreck from '@hapi/wreck'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import { config } from '../../../../config/config.js'
import {
  createGovPayPayment,
  getGovPayPaymentStatus
} from './create-payment.js'

vi.mock('@hapi/wreck', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

describe('#createPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.set('govPay.apiUrl', 'https://pay.example.test/v1/')
    config.set('govPay.apiKey', 'test-api-key')
    config.set('govPay.serviceChargeAmountPence', 2600)
    config.set('appBaseUrl', 'http://localhost:3000/')
  })

  test('createGovPayPayment returns payment id and next url', async () => {
    wreck.post.mockResolvedValue({
      res: { statusCode: 201 },
      payload: {
        payment_id: 'pid_123',
        _links: {
          next_url: {
            href: 'https://www.payments.service.gov.uk/secure/abc123'
          }
        }
      }
    })

    const result = await createGovPayPayment()

    expect(result).toEqual({
      paymentId: 'pid_123',
      nextUrl: 'https://www.payments.service.gov.uk/secure/abc123'
    })

    expect(wreck.post).toHaveBeenCalledWith(
      'https://pay.example.test/v1/payments',
      expect.objectContaining({
        json: true,
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json'
        },
        payload: expect.objectContaining({
          amount: 2600,
          description: 'Annual report receipt of waste service charge',
          return_url: 'http://localhost:3000/payment-details',
          reference: expect.stringMatching(/^WASTE-[A-Z0-9]{8}$/)
        })
      })
    )
  })

  test.each([
    {
      payload: { description: 'description message' },
      message: 'description message'
    },
    { payload: { message: 'message text' }, message: 'message text' },
    { payload: { detail: 'detail text' }, message: 'detail text' },
    { payload: {}, message: 'GovPay returned status 500' }
  ])(
    'createGovPayPayment throws useful reason for failed status: $message',
    async ({ payload, message }) => {
      wreck.post.mockResolvedValue({
        res: { statusCode: 500 },
        payload
      })

      await expect(createGovPayPayment()).rejects.toThrow(message)
    }
  )

  test('createGovPayPayment throws when next_url is missing', async () => {
    wreck.post.mockResolvedValue({
      res: { statusCode: 201 },
      payload: { payment_id: 'pid_123' }
    })

    await expect(createGovPayPayment()).rejects.toThrow(
      'GovPay did not return a next_url for payment journey'
    )
  })

  test('getGovPayPaymentStatus returns status, amount and reference', async () => {
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
        json: true,
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
    'getGovPayPaymentStatus throws useful reason for failed status: $message',
    async ({ payload, message }) => {
      wreck.get.mockResolvedValue({
        res: { statusCode: 502 },
        payload
      })

      await expect(getGovPayPaymentStatus('pid_123')).rejects.toThrow(message)
    }
  )
})
