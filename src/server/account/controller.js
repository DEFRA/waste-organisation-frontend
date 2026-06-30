import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getPaymentStatus } from '../common/helpers/govpay/paymentStatus.js'

export const accountController = {
  async handler(request, h) {
    const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

    const { id, currentOrganisationId, currentOrganisationName } =
      request.auth.credentials

    const pageContent = content.account(request, currentOrganisationName)
    const { notPaidNotice } = content.sharedServiceChargeInfo(
      request,
      currentOrganisationName
    )

    const organisation = await request.backendApi.getOrganisation(
      id,
      currentOrganisationId
    )

    const paymentStatus = getPaymentStatus(organisation)

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      switchOrganisation: pageContent.switchOrganisation,
      importantNotice: notPaidNotice,
      cards: pageContent.cards,
      isServiceChargeEnabled,
      paymentStatus: {
        ...paymentStatus,
        tagClass: paymentStatus.disabled ? 'govuk-tag--red' : 'govuk-tag--green'
      },
      switchOrganisationHref: paths.signinDefraIdCallback,
      reportWasteHref: paths.nextAction,
      serviceChargeHref: paths.serviceCharge,
      apiListHref: paths.apiList,
      manageAccountHref: config.get('auth.defraId.accountManagementUrl')
    })
  }
}
