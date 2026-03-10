import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const reviewPaymentController = {
  handler(request, h) {
    const pageContent = content.reviewPayment(request)

    return h.view('reviewPayment/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      accessUntil: pageContent.accessUntil,
      sectionHeading: pageContent.sectionHeading,
      organisation: pageContent.organisation,
      continueText: pageContent.continue,
      continueHref: paths.initiatePayment,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.serviceCharge
      }
    })
  }
}
