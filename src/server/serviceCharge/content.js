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
      },
      cy: {
        notPaidNotice: {
          title: 'Pwysig',
          heading: `Mae angen ichi dalu'ch tâl gwasanaeth blynyddol ar gyfer ${organisationName || '[Waste receiving organisation or business name]'} cyn y gallwch roi gwybod am eich symudiadau.`,
          body: 'Os oes arnoch angen help neu os oes gennych gwestiwn am y tâl gwasanaeth, ffoniwch 03000 203 781.'
        },
        alreadyPaidNotice: {
          title: 'Pwysig',
          heading: 'zzzzz',
          body: 'zzzzz'
        },
        duplicatePaymentNotice: {
          title: 'Pwysig',
          heading: 'Mae taliad ar y gweill yn barod',
          body: "Mae taliad tâl gwasanaeth ar gyfer y cyfrif hwn yn mynd rhagddo'n barod. Peidiwch â rhoi cynnig arall arni."
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
      },
      cy: {
        title:
          "Talu'r tâl blynyddol ar gyfer y gwasanaeth rhoi gwybod am dderbyn gwastraff",
        heading: heading(
          "Talu'r tâl blynyddol ar gyfer y gwasanaeth rhoi gwybod am dderbyn gwastraff",
          null,
          organisationName
        ),
        cost: `Y gost yw ${formatPounds(priceInPence)} i bob sefydliad.`,
        requirementsIntro: 'I dalu am y tâl gwasanaeth, bydd arnoch angen:',
        requirements: [
          'cerdyn credyd neu ddebyd',
          "cyfeiriad e-bost i gael cadarnhad o'r taliad"
        ],
        warning:
          "Ni fyddwch yn gallu defnyddio'r gwasanaeth hwn i roi gwybod am eich symudiadau gwastraff nes eich bod wedi talu'r tâl gwasanaeth.",
        payServiceCharge: 'Talu tâl gwasanaeth',
        cancel: 'Canslo'
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
      },
      cy: {
        title: 'Tâl gwasanaeth blynyddol Rhoi gwybod bod am dderbyn gwastraff',
        heading: heading(
          'Tâl gwasanaeth blynyddol Rhoi gwybod bod am dderbyn gwastraff',
          null,
          organisationName
        ),
        intro:
          "Ar ôl ichi dalu'r tâl gwasanaeth, bydd gan eich sefydliad fynediad llawn i roi gwybod am symudiadau gwastraff hyd at",
        accessUntilDateIso: 'cy',
        sectionHeading: 'Adolygu swm y taliad',
        organisation: {
          heading: 'Sefydliad',
          nameLabel: 'Enw',
          name:
            organisationName ||
            '[Waste receiving organisation or business name]',
          totalCostLabel: 'Cyfanswm y gost'
        },
        continue: 'Parhau',
        cancel: 'Canslo'
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
      },
      cy: {
        title: 'zzzzz',
        heading: heading('zzzzz', 'zzzzz', null),
        link: {
          href: config.get('links.startPage'),
          text: 'zzzzz'
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
      },
      cy: {
        success: {
          pageTitle: "Cadarnhad o'r taliad",
          heading: heading("Cadarnhad o'r taliad", null, organisationName),
          referenceLabel: 'Eich cyfeirnod talu',
          summaryHeading: 'Crynodeb Taliad',
          paymentForLabel: 'Taliad ar gyfer',
          paymentForValue:
            'Tâl gwasanaeth blynyddol Rhoi gwybod am dderbyn gwastraff',
          organisationLabel: 'Sefydliad',
          organisationValue:
            organisationName ||
            '[Waste receiving organisation or business name]',
          totalAmountLabel: 'Cyfanswm',
          totalAmountValue: formatPounds(priceInPence),
          whatHappensNextHeading: 'Beth fydd yn digwydd nesaf',
          whatHappensNext: [
            "Byddwch chi'n cael e-bost i gadarnhau eich bod wedi talu.",
            "Gallwch nawr ddefnyddio'r gwasanaeth i roi gwybod am eich symudiadau gwastraff."
          ],
          returnToAccountLabel: `Dychwelyd i gyfrif derbyn gwastraff ${organisationName}`
        },
        pending: {
          pageTitle: 'zzzzz',
          heading: heading('zzzzz', null, organisationName),
          summaryContent: 'zzzzz',
          whatHappensNextHeading: 'zzzzz',
          whatHappensNext: ['zzzzz'],
          returnToAccountLabel: `Dychwelyd i gyfrif derbyn gwastraff ${organisationName}`
        },
        unsuccessful: {
          pageTitle: 'Nid oedd eich taliad yn llwyddiannus',
          heading: heading(
            'Nid oedd eich taliad yn llwyddiannus',
            null,
            organisationName
          ),
          summaryContent:
            "Cysylltwch â'ch banc i gael rhagor o fanylion neu rhowch gynnig arall arni.",
          returnToAccountLabel: 'Rhowch gynnig arall ar dalu'
        }
      }
    })
}
