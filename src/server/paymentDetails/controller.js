import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const paymentDetailsController = {
  handler(request, h) {
    const pageContent = content.paymentDetails(request)

    return h.view('paymentDetails/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      summary: pageContent.summary,
      card: pageContent.card,
      billingAddress: pageContent.billingAddress,
      contactDetails: pageContent.contactDetails,
      continueText: pageContent.continue,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.account
      },
      backLink: paths.reviewPayment
    })
  }
}
