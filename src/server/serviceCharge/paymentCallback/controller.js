import boom from '@hapi/boom'
import crypto from 'node:crypto'
import { config } from '../../../config/config.js'
import { statusCodes } from '../../common/constants/status-codes.js'

export const paymentWebhookController = {
  async handler(request, h) {
    // TODO fix the logic when we've finished debugging
    const webhookSigningSecret = config.get('govPay.webhookSigningSecret')
    const webhookMessageBody = request.payload
    if (webhookMessageBody) {
      const hmac = crypto
        .createHmac('sha256', webhookSigningSecret)
        .update(webhookMessageBody)
        .digest('hex')

      if (hmac === request.headers['pay-signature']) {
        try {
          const parsedMessage = JSON.parse(webhookMessageBody)
          request.logger.info(
            `webhookMessageBody: ${JSON.stringify(parsedMessage, null, 4)}`
          )
          request.backendApi.savePayment(
            parsedMessage.resource.metadata.organisationId,
            parsedMessage.resource
          )
        } catch (e) {
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
    return h.response().code(statusCodes.ok)
  }
}
