import crypto from 'crypto'
import { config } from '../../../config/config.js'
import {
  initialiseServer,
  wreckPutMock
} from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

describe('#paymentWebhookController', () => {
  let server
  const webhookSigningSecret = 'test-secret'
  const payload = {
    webhook_message_id: '123abc',
    api_version: 1,
    created_date: '2019-07-11T10:36:26.988Z',
    resource_id: 'hu20sqlact5260q2nanm0q8u93',
    resource_type: 'payment',
    event_type: 'card_payment_captured',
    resource: {
      amount: 5000,
      description: 'Pay your council tax',
      reference: '12345',
      language: 'en',
      metadata: { organisationId: 'orgid-123' },
      email: 'sherlock.holmes@example.com',
      state: {
        status: 'success',
        finished: true
      },
      payment_id: 'hu20sqlact5260q2nanm0q8u93',
      payment_provider: 'stripe',
      created_date: '2021-10-19T10:05:45.454Z',
      refund_summary: {
        status: 'available',
        amount_available: 5000,
        amount_submitted: 0
      },
      settlement_summary: {},
      card_details: {
        last_digits_card_number: '1234',
        first_digits_card_number: '123456',
        cardholder_name: 'Sherlock Holmes',
        expiry_date: '04/24',
        billing_address: {
          line1: '221 Baker Street',
          line2: 'Flat b',
          postcode: 'NW1 6XE',
          city: 'London',
          country: 'GB'
        },
        card_brand: 'Visa',
        card_type: 'debit'
      },
      delayed_capture: false,
      moto: false,
      provider_id: '10987654321',
      return_url: 'https://your.service.gov.uk/completed'
    }
  }

  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', true)
    config.set('govPay.webhookSigningSecret', webhookSigningSecret)
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
    config.set('featureFlags.serviceCharge', false)
  })

  test('returns 200 and saves payment when signature is valid', async () => {
    wreckPutMock.mockReturnValue({ message: 'success' })
    const payloadString = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', webhookSigningSecret)
      .update(payloadString)
      .digest('hex')

    const response = await server.inject({
      method: 'POST',
      url: paths.paymentCallback,
      headers: { 'pay-signature': signature },
      payload: payloadString
    })

    expect(response.statusCode).toBe(200)
    expect(wreckPutMock).toHaveBeenCalled()
  })

  test("returns 200 even when the payload isn't parsable as json", async () => {
    wreckPutMock.mockImplementation(async () => {
      throw Error()
    })
    const payloadString = 'fish'
    const signature = crypto
      .createHmac('sha256', webhookSigningSecret)
      .update(payloadString)
      .digest('hex')

    const response = await server.inject({
      method: 'POST',
      url: paths.paymentCallback,
      headers: { 'pay-signature': signature },
      payload: payloadString
    })

    expect(response.statusCode).toBe(200)
    expect(wreckPutMock).not.toHaveBeenCalled()
  })
})
