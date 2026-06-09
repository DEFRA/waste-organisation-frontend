import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const paymentConfirmationController = {
  async handler(request, h) {
    const paymentId = request.yar.get('govPayPaymentId')

    if (!paymentId) {
      return h.redirect(paths.account)
    }

    const result = await request.backendApi.paymentStatus(
      request.auth.credentials.currentOrganisationId,
      paymentId
    )

    console.log('result', result)

    const pageContent = content.paymentDetails(request)

    return h.view('serviceCharge/paymentConfirmation/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      referenceLabel: pageContent.referenceLabel,
      paymentReference: 'sdfksdfmklm',
      summaryHeading: pageContent.summaryHeading,
      paymentSummary: {
        paymentForLabel: pageContent.paymentForLabel,
        paymentForValue: pageContent.paymentForValue,
        organisationLabel: pageContent.organisationLabel,
        organisationValue: 'organisationName',
        totalAmountLabel: pageContent.totalAmountLabel,
        totalAmountValue: '£23.54'
      },
      whatHappensNextHeading: pageContent.whatHappensNextHeading,
      whatHappensNext: pageContent.whatHappensNext,
      returnLink: {
        text: 'fdkjglndlkfgnm',
        href: paths.account
      }
    })
  }
}
