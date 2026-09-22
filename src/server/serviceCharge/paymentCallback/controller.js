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
          const paymentId = parsedMessage.resource?.payment_id
          const status = parsedMessage.resource?.state?.status
          const organisationId =
            parsedMessage.resource?.metadata?.organisationId

          request.logger.info(
            `GovPay webhook for organisation ${organisationId} payment ${paymentId}: ${status}`
          )
          request.backendApi.savePayment(
            parsedMessage.resource.metadata.organisationId,
            parsedMessage.resource
          )
        } catch (e) {
          request.logger.error(
            { err: e },
            `Error saving payment: ${e?.message ?? 'unknown error'}`
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
