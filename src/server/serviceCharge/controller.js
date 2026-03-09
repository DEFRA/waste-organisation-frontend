import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const serviceChargeController = {
  handler(request, h) {
    const pageContent = content.serviceCharge(request)

    return h.view('serviceCharge/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      cost: pageContent.cost,
      requirementsIntro: pageContent.requirementsIntro,
      requirements: pageContent.requirements,
      warning: pageContent.warning,
      payServiceCharge: pageContent.payServiceCharge,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.account
      }
    })
  }
}
