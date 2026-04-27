import boom from '@hapi/boom'
import crypto from 'crypto'
import { config } from '../../../config/config.js'

export const paymentWebhookController = {
  async handler(request, h) {
    const webhookSigningSecret = config.get('govPay.webhookSigningSecret')
    const webhookMessageBody = request.payload
    const hmac = crypto
      .createHmac('sha256', webhookSigningSecret)
      .update(webhookMessageBody)
      .digest('hex')

    if (hmac === request.headers('Pay-Signature')) {
      try {
        const parsedMessage = JSON.parse(webhookMessageBody)
        request.logger.info(
          `webhookMessageBody: ${JSON.stringify(parsedMessage, null, 4)}`
        )
      } catch (e) {
        request.logger.error(
          `Error parsing message: ${e} message: webhookMessageBody} stacktrace: ${e.stack}`
        )
      }
      try {
        request.backendApi.savePayment(
          request.auth.credentials.currentOrganisationId,
          parsedMessage.resource
        )
      } catch (e) {
        request.logger.error(
          `Error saving payment: ${e} message: ${JSON.stringify(parsedMessage, null, 4)} stacktrace: ${e.stack}`
        )
      }
      h.response().code(200)
    } else {
      throw boom.forbidden('Signature not valid')
    }
  }
}

/*
{
  "webhook_message_id": "123abc",
  "api_version": 1,
  "created_date": "2019-07-11T10:36:26.988Z",
  "resource_id": "hu20sqlact5260q2nanm0q8u93",
  "resource_type": "payment",
  "event_type": "card_payment_captured",
  "resource": {
    "amount": 5000,
    "description": "Pay your council tax",
    "reference": "12345",
    "language": "en",
    "email": "sherlock.holmes@example.com",
    "state": {
      "status": "success",
      "finished": true
    },
    "payment_id": "hu20sqlact5260q2nanm0q8u93",
    "payment_provider": "stripe",
    "created_date": "2021-10-19T10:05:45.454Z",
    "refund_summary": {
      "status": "available",
      "amount_available": 5000,
      "amount_submitted": 0
    },
    "settlement_summary": {},
    "card_details": {
      "last_digits_card_number": "1234",
      "first_digits_card_number": "123456",
      "cardholder_name": "Sherlock Holmes",
      "expiry_date": "04/24",
      "billing_address": {
        "line1": "221 Baker Street",
        "line2": "Flat b",
        "postcode": "NW1 6XE",
        "city": "London",
        "country": "GB"
      },
      "card_brand": "Visa",
      "card_type": "debit"
    },
    "delayed_capture": false,
    "moto": false,
    "provider_id": "10987654321",
    "return_url": "https://your.service.gov.uk/completed"
  }
}
*/
