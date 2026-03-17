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

    const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

    const organisationName = request?.auth?.credentials?.currentOrganisationName
    const organisationId = request?.auth?.credentials?.currentOrganisationId

    const pageContent = content.account(request, organisationName)
    const [paymentStatus] = request.yar.flash(paymentStatusFlash)

    if (
      isServiceChargeEnabled &&
      paymentStatus === paymentStatusSuccess &&
      organisationId
    ) {
      const existingStatusByOrg = request.yar.get(serviceChargeStatusKey) || {}
      existingStatusByOrg[organisationId] = serviceChargeStatusPaid
      request.yar.set(serviceChargeStatusKey, existingStatusByOrg)
    }

    const serviceChargeStatusByOrg =
      request.yar.get(serviceChargeStatusKey) || {}
    const isServiceChargePaid =
      isServiceChargeEnabled &&
      organisationId &&
      serviceChargeStatusByOrg[organisationId] === serviceChargeStatusPaid

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      switchOrganisation: pageContent.switchOrganisation,
      importantNotice: pageContent.importantNotice,
      cards: pageContent.cards,
      isServiceChargeEnabled,
      isServiceChargePaid,
      switchOrganisationHref: paths.signinDefraIdCallback,
      reportWasteHref: paths.nextAction,
      serviceChargeHref: paths.serviceCharge,
      apiListHref: paths.apiList,
      manageAccountHref: config.get('auth.defraId.accountManagementUrl')
    })
  }
}
