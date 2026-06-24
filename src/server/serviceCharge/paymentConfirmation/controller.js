import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const paymentConfirmationController = {
  async handler(request, h) {
    const paymentId = request.yar.get('govPayPaymentId')

    if (paymentId) {
      const { payment } = await request.backendApi.paymentStatus(
        request.auth.credentials.currentOrganisationId,
        paymentId
      )

      const pageContent = content.paymentDetails(
        request,
        payment.amount,
        request.auth.credentials.currentOrganisationName
      )

      if (payment.status === 'payment_succeeded') {
        return h.view('serviceCharge/paymentConfirmation/success', {
          paymentReference: payment.reference,
          returnToAccountLink: paths.account,
          ...pageContent.success
        })
      }

      if (payment.status === 'payment_failed') {
        return h.view('serviceCharge/paymentConfirmation/message', {
          returnToAccountLink: paths.serviceCharge,
          ...pageContent.declined
        })
      }

      if (payment.status === 'payment_in_progress') {
        return h.view('serviceCharge/paymentConfirmation/message', {
          returnToAccountLink: paths.account,
          ...pageContent.pending
        })
      }
    }

    return h.redirect(paths.account)
  }
}
