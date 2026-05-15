import boom from '@hapi/boom'
import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'

export const initiatePaymentController = {
  async handler(request, h) {
    try {
      const { serviceChargeAmountPence } = config.get('govPay')
      const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')

      const receivedDate = new Date(request.info.received)

      const result = await request.backendApi.initiatePayment(
        request.auth.credentials.currentOrganisationId,
        {
          amount: serviceChargeAmountPence,
          description: SERVICE_CHARGE_DESCRIPTION,
          returnUrl: `${appBaseUrl}${paths.paymentDetails}`,
          metadata: {
            organisationId: request.auth.credentials.currentOrganisationId,
            organisationName: request.auth.credentials.currentOrganisationName,
            servicePeriodStart: receivedDate,
            servicePeriodEnd: new Date(
              `${receivedDate.getFullYear() + 1}-10-31`
            )
          }
        }
      )

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
