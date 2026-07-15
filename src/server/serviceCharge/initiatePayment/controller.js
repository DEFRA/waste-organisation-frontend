import boom from '@hapi/boom'
import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'
const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'

export const initiatePaymentController = {
  async handler(request, h) {
    try {
      const { id, currentOrganisationId } = request.auth.credentials

      const organisation = await request.backendApi.getOrganisation(
        id,
        currentOrganisationId
      )

      const paymentPeriods = organisation.paymentPeriods

      if (!paymentPeriods || paymentPeriods < 1) {
        const { alreadyPaidNotice } = content.sharedServiceChargeInfo(
          request,
          request.auth.credentials.currentOrganisationName
        )
        request.yar.flash('infoMessage', alreadyPaidNotice)
        return h.redirect(paths.account)
      }
      const paymentPeriod = paymentPeriods[0]

      const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')

      const result = await request.backendApi.initiatePayment(
        request.auth.credentials.currentOrganisationId,
        {
          amount: paymentPeriod.priceInPence,
          description: SERVICE_CHARGE_DESCRIPTION,
          returnUrl: `${appBaseUrl}${paths.paymentDetails}`,
          metadata: {
            organisationId: request.auth.credentials.currentOrganisationId,
            organisationName: request.auth.credentials.currentOrganisationName,
            servicePeriodStart: paymentPeriod.from,
            servicePeriodEnd: paymentPeriod.to
          }
        }
      )

      if (result.message === 'duplicate payment') {
        const previousRequest = request.yar.get('govPayPaymentId')

        if (previousRequest === result.payment.paymentId) {
          const paymentStatus = await request.backendApi.paymentStatus(
            currentOrganisationId,
            result.payment.paymentId
          )
          return h.redirect(paymentStatus.payment.govPayLinks.next_url.href)
        }

        const { duplicatePaymentNotice } = content.sharedServiceChargeInfo(
          request,
          request.auth.credentials.currentOrganisationName
        )
        request.yar.flash('infoMessage', duplicatePaymentNotice)
        return h.redirect(paths.account)
      }

      if (result.errors) {
        throw new Error('Error initiateing payment')
      }

      const { paymentId, govPayLinks } = result.payment
      request.yar.set('govPayPaymentId', paymentId)
      return h.redirect(govPayLinks.next_url.href)
    } catch (error) {
      request.logger.error(
        { err: error },
        `Failed to initiate GovPay payment: ${error?.message ?? 'unknown error'}`
      )

      throw boom.badGateway('Unable to initiate payment')
    }
  }
}
