import boom from '@hapi/boom'
import crypto from 'node:crypto'
import { config } from '../../../config/config.js'

export const paymentWebhookController = {
  async handler(request, h) {
    // TODO fix the logic when we've finished debugging
    console.log('fish')
    const webhookSigningSecret = config.get('govPay.webhookSigningSecret')
    const webhookMessageBody = request.payload
    if (webhookMessageBody) {
      const hmac = crypto
        .createHmac('sha256', webhookSigningSecret)
        .update(webhookMessageBody)
        .digest('hex')
      console.log('fish 1')

      if (hmac === request.headers['pay-signature']) {
        console.log('fish 2')
        try {
          const parsedMessage = JSON.parse(webhookMessageBody)
          request.logger.info(
            `webhookMessageBody: ${JSON.stringify(parsedMessage, null, 4)}`
          )
          console.log('fish 3')
          request.backendApi.savePayment(
            parsedMessage.resource.metadata.organisationId,
            parsedMessage.resource
          )
          console.log('fish 4')
        } catch (e) {
          console.log(
            'webhookMessageBody: ',
            JSON.stringify(webhookMessageBody, null, 4)
          )
          request.logger.error(
            `Error saving payment: ${e} message: ${webhookMessageBody} stacktrace: ${e.stack}`
          )
        }
      } else {
        throw boom.forbidden('Signature not valid')
      }
    } else {
      request.logger.error(`No message body`)
    }
    return h.response().code(200)
  }
}
