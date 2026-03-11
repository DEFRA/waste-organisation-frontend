import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getGovPayPaymentStatus } from '../common/helpers/govpay/create-payment.js'

const paymentSuccessFlash = 'paymentStatus'
const paymentSuccessState = 'success'

const formatPounds = (amountInPence) => {
  if (typeof amountInPence !== 'number') {
    return '£0.00'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amountInPence / 100)
}

export const paymentDetailsController = {
  async handler(request, h) {
    if (!config.get('featureFlags.serviceCharge')) {
      throw boom.notFound()
    }

    const paymentId = request.yar.get('govPayPaymentId')

    if (!paymentId) {
      return h.redirect(paths.account)
    }

    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.paymentDetails(request)

    let paymentReference = ''
    let paymentAmount = 0

    try {
      const payment = await getGovPayPaymentStatus(paymentId)
      const paymentStatus = payment?.status
      paymentReference = payment?.reference ?? ''
      paymentAmount = payment?.amount ?? 0

      if (paymentStatus === paymentSuccessState) {
        request.yar.flash(paymentSuccessFlash, paymentSuccessState)
      }
    } catch (error) {
      request.logger.error(
        `Failed to fetch GovPay payment status: ${error?.message ?? 'unknown error'}`
      )
    }

    request.yar.clear('govPayPaymentId')

    return h.view('paymentDetails/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      referenceLabel: pageContent.referenceLabel,
      paymentReference,
      summaryHeading: pageContent.summaryHeading,
      paymentSummary: {
        paymentForLabel: pageContent.paymentForLabel,
        paymentForValue: pageContent.paymentForValue,
        organisationLabel: pageContent.organisationLabel,
        organisationValue: organisationName,
        totalAmountLabel: pageContent.totalAmountLabel,
        totalAmountValue: formatPounds(paymentAmount)
      },
      whatHappensNextHeading: pageContent.whatHappensNextHeading,
      whatHappensNext: pageContent.whatHappensNext,
      returnLink: {
        text: `${pageContent.returnToAccountPrefix} ${organisationName} ${pageContent.returnToAccountSuffix}`
          .replaceAll(/\s+/g, ' ')
          .trim(),
        href: paths.account
      }
    })
  }
}
