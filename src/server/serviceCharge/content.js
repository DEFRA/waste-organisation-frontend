import { config } from '../../config/config.js'
import { getContentForLanguage, heading } from '../../config/content.js'

const formatPounds = (amountInPence) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amountInPence / 100)

/* v8 ignore next */
export const serviceCharge = {
  sharedServiceChargeInfo: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        notPaidNotice: {
          title: 'Important',
          heading: `You need to pay your annual service charge for ${organisationName || '[Waste receiving organisation or business name]'} before you can report your waste movements.`,
          body: 'If you need help or have a question about service charge, call 03000 203 781'
        },
        alreadyPaidNotice: {
          title: 'Important',
          heading: 'A payment has already been submitted',
          body: 'A service charge payment for this account has already been processed. Do not try again.'
        },
        duplicatePaymentNotice: {
          title: 'Important',
          heading: 'A payment is already in progress',
          body: 'A service charge payment for this account is already in progress. Do not try again.'
        }
      }
    }),
  serviceCharge: (request, priceInPence, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Pay the annual report receipt of waste service charge',
        heading: heading(
          'Pay the annual report receipt of waste service charge',
          null,
          organisationName
        ),
        cost: `The cost is ${formatPounds(priceInPence)} per organisation.`,
        requirementsIntro: 'To pay for the service charge, you will need:',
        requirements: [
          'a credit or debit card',
          'an email address to receive the payment confirmation'
        ],
        warning:
          'You will not be able to use this service to report your waste movements until you have paid the service charge.',
        payServiceCharge: 'Pay service charge',
        cancel: 'Cancel'
      }
    }),
  reviewPayment: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual Report receipt of waste charge',
        heading: heading(
          'Annual Report receipt of waste charge',
          null,
          organisationName
        ),
        intro:
          'Once you have paid the service charge, your organisation will have full access to report waste movements until',
        accessUntilDateIso: 'en',
        sectionHeading: 'Review the payment amount',
        organisation: {
          heading: 'Organisation',
          nameLabel: 'Name',
          name:
            organisationName ||
            '[Waste receiving organisation or business name]',
          totalCostLabel: 'Total cost'
        },
        continue: 'Continue',
        cancel: 'Cancel'
      }
    }),
  cannotMakePayment: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Sorry, you cannot make a payment for this organisation',
        heading: heading(
          'Sorry, you cannot make a payment for this organisation',
          'Based on your answer, you cannot continue as local authorities are currently unable to use this service.',
          null
        ),
        link: {
          href: config.get('links.startPage'),
          text: 'Find out more about Digital waste tracking'
        }
      }
    }),
  paymentDetails: (request, priceInPence, organisationName) =>
    getContentForLanguage(request, {
      en: {
        success: {
          pageTitle: 'Payment confirmation',
          heading: heading('Payment confirmation', null, organisationName),
          referenceLabel: 'Your payment reference',
          summaryHeading: 'Payment summary',
          paymentForLabel: 'Payment for',
          paymentForValue: 'Report receipt of waste annual service charge',
          organisationLabel: 'Organisation',
          organisationValue:
            organisationName ||
            '[Waste receiving organisation or business name]',
          totalAmountLabel: 'Total amount',
          totalAmountValue: formatPounds(priceInPence),
          whatHappensNextHeading: 'What happens next',
          whatHappensNext: [
            'You will receive an email confirming your payment.',
            'You can now use the service to report your waste movements.'
          ],
          returnToAccountLabel: `Return to ${organisationName} waste receiving account`
        },
        pending: {
          pageTitle: 'Payment pending',
          heading: heading('Payment pending', null, organisationName),
          summaryContent: 'Your payment is currently being processed.',
          whatHappensNextHeading: 'What happens next',
          whatHappensNext: [
            'Once your payment has been completed, you will receive an email confirmation. You will then be able to use the service to report your waste movements.'
          ],
          returnToAccountLabel: `Return to ${organisationName} waste receiving account`
        },
        unsuccessful: {
          pageTitle: 'Your payment has been unsuccessful',
          heading: heading(
            'Your payment has been unsuccessful',
            null,
            organisationName
          ),
          summaryContent: 'Contact your bank for more details or try again.',
          returnToAccountLabel: `Try payment again`
        }
      }
    })
}
