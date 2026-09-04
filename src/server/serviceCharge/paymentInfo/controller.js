import { serviceCharge } from '../content.js'
import { paths } from '../../../config/paths.js'

export const serviceChargeController = {
  async handler(request, h) {
    const { id, currentOrganisationId } = request.auth.credentials

    const organisation = await request.backendApi.getOrganisation(
      id,
      currentOrganisationId
    )

    if (
      !organisation.paymentPeriods ||
      organisation.paymentPeriods.length < 1
    ) {
      request.yar.flash(
        'infoMessage',
        serviceCharge.alreadyPaidNotice(
          request,
          request.auth.credentials.currentOrganisationName
        )
      )
      return h.redirect(paths.account)
    }

    const paymentPeriod = organisation.paymentPeriods[0]

    const pageContent = serviceCharge.serviceCharge(
      request,
      paymentPeriod.priceInPence,
      request.auth.credentials.currentOrganisationName
    )

    return h.view('serviceCharge/paymentInfo/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      cost: pageContent.cost,
      requirementsIntro: pageContent.requirementsIntro,
      requirements: pageContent.requirements,
      warning: pageContent.warning,
      payServiceCharge: pageContent.payServiceCharge,
      payServiceChargeHref: paths.reviewPayment,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.account
      }
    })
  }
}
