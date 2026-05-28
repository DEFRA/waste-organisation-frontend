import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const MESSAGE_TYPE = 'payment-periods'

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
      return h.redirect(paths.cannotMakePayment)
    }

    const paymentPeriod = organisation.paymentPeriods[0]
    request.yar.flash(MESSAGE_TYPE, paymentPeriod)

    const pageContent = content.serviceCharge(
      request,
      paymentPeriod.priceInPence
    )

    return h.view('serviceCharge/paymentInfo/index', {
      pageTitle: pageContent.title,
      heading: {
        text: pageContent.heading
      },
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
