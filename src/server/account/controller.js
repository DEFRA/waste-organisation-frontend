import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const paymentStatusFlash = 'paymentStatus'
const paymentStatusSuccess = 'success'
const serviceChargeStatusKey = 'serviceChargeStatus'
const serviceChargeStatusPaid = 'paid'

export const accountController = {
  handler(request, h) {
    if (!config.get('featureFlags.accountPage')) {
      return h.redirect(paths.nextAction)
    }

    const organisationName = request?.auth?.credentials?.currentOrganisationName
    const organisationId = request?.auth?.credentials?.currentOrganisationId

    const pageContent = content.account(request, organisationName)
    const [paymentStatus] = request.yar.flash(paymentStatusFlash)

    if (paymentStatus === paymentStatusSuccess && organisationId) {
      const existingStatusByOrg = request.yar.get(serviceChargeStatusKey) || {}
      existingStatusByOrg[organisationId] = serviceChargeStatusPaid
      request.yar.set(serviceChargeStatusKey, existingStatusByOrg)
    }

    const serviceChargeStatusByOrg =
      request.yar.get(serviceChargeStatusKey) || {}
    const isServiceChargePaid =
      organisationId &&
      serviceChargeStatusByOrg[organisationId] === serviceChargeStatusPaid

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      switchOrganisation: pageContent.switchOrganisation,
      cards: pageContent.cards,
      isServiceChargePaid,
      switchOrganisationHref: paths.signinDefraIdCallback,
      reportWasteHref: paths.nextAction,
      serviceChargeHref: paths.serviceCharge,
      manageAccountHref: config.get('auth.defraId.accountManagementUrl')
    })
  }
}
