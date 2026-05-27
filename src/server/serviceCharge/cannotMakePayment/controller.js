import { content } from '../../../config/content.js'

export const cannotMakePaymentController = {
  async handler(request, h) {
    const pageContent = content.cannotMakePayment(request)
    return h.view('serviceCharge/cannotMakePayment/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      link: pageContent.link
    })
  }
}
