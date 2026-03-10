import boom from '@hapi/boom'

import { createGovPayPayment } from '../common/helpers/govpay/create-payment.js'

export const initiatePaymentController = {
  async handler(request, h) {
    try {
      const { paymentId, nextUrl } = await createGovPayPayment()
      request.yar.set('govPayPaymentId', paymentId)
      return h.redirect(nextUrl)
    } catch (error) {
      request.logger.error(
        `Failed to initiate GovPay payment: ${error?.message ?? 'unknown error'}`
      )
      throw boom.badGateway('Unable to initiate payment')
    }
  }
}
