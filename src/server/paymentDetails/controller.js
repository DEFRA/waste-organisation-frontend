import { paths } from '../../config/paths.js'
import { getGovPayPaymentStatus } from '../common/helpers/govpay/create-payment.js'

const paymentSuccessFlash = 'paymentStatus'
const paymentSuccessState = 'success'

export const paymentDetailsController = {
  async handler(request, h) {
    const paymentId = request.yar.get('govPayPaymentId')

    if (!paymentId) {
      return h.redirect(paths.account)
    }

    try {
      const paymentStatus = await getGovPayPaymentStatus(paymentId)

      if (paymentStatus === paymentSuccessState) {
        request.yar.flash(paymentSuccessFlash, paymentSuccessState)
      }
    } catch (error) {
      request.logger.error(
        `Failed to fetch GovPay payment status: ${error?.message ?? 'unknown error'}`
      )
    }

    request.yar.clear('govPayPaymentId')
    return h.redirect(paths.account)
  }
}
