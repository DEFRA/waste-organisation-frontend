import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const GOV_PAY_PAYMENT_LINK =
  'https://products.payments.service.gov.uk/pay/3df2570a378b4527a07b87337a9944bd?reference=DEMO-TEST'

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
      continueHref: GOV_PAY_PAYMENT_LINK,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.serviceCharge
      }
    })
  }
}
