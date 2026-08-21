import { getContentForLanguage, heading } from '../../config/content.js'

/* v8 ignore next */
export const account = {
  account: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Waste receiving account',
        heading: heading('Waste receiving account', null, organisationName),
        switchOrganisation: 'Switch organisation',
        cards: {
          reportWaste: { text: 'Report receipt of waste' },
          manageAccount: { text: 'Manage account' },
          serviceCharge: {
            text: 'Service charge',
            tag: 'Due October 2026', // used when service charge feature is disabled
            paymentDueTag: 'Payment due',
            paidTag: 'Paid',
            nextPaymentDue: 'Next payment due',
            payNow: 'Pay Now'
          }
        }
      },
      cy: {
        title: 'Cyfrif derbyn gwastraff',
        heading: heading('Cyfrif derbyn gwastraff', null, organisationName),
        switchOrganisation: 'Newid sefydliad',
        cards: {
          reportWaste: { text: 'Rhoi gwybod am dderbyn gwastraff' },
          manageAccount: { text: "Rheoli'r cyfrif" },
          serviceCharge: {
            text: 'Tâl gwasanaeth',
            tag: 'Yn ddyledus ym mis Hydref 2026', // used when service charge feature is disabled
            paymentDueTag: 'Taliad yn ddyledus',
            paidTag: 'Wedi talu',
            nextPaymentDue: 'Taliad nesaf yn ddyledus ym mis',
            payNow: 'zzzzz'
          }
        }
      }
    }),
  nextAction: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Report receipt of waste',
        heading: heading('Report receipt of waste', null, organisationName),
        questions: {
          connectYourSoftware: 'Manage my API code',
          downloadSpreadsheet: 'Download spreadsheet template',
          uploadSpreadsheet: 'Upload a spreadsheet',
          updateSpreadsheet: 'Upload a spreadsheet that has Waste tracking IDs'
        },
        questionsNotPaid: {
          downloadSpreadsheet: 'Download spreadsheet template'
        },
        error: {
          pageTitle: 'Error: Report receipt of waste',
          title: 'There is a problem',
          message: 'You must select an option'
        },
        continueAction: 'Continue'
      },
      cy: {
        title: 'Rhoi gwybod am dderbyn gwastraff',
        heading: heading(
          'Rhoi gwybod am dderbyn gwastraff ',
          null,
          organisationName
        ),
        questions: {
          connectYourSoftware: 'Rheoli fy nghod API',
          downloadSpreadsheet: 'Lawrlwytho templed y daenlen',
          uploadSpreadsheet: 'Uwchlwytho taenlen',
          updateSpreadsheet:
            "Uwchlwytho taenlen sy'n cynnwys IDs Tracio Gwastraff"
        },
        questionsNotPaid: {
          downloadSpreadsheet: 'Lawrlwytho templed y daenlen'
        },
        error: {
          pageTitle: 'Gwall: Rhoi gwybod am dderbyn gwastraff',
          title: 'Mae yna broblem',
          message: 'Rhaid ichi ddewis opsiwn'
        },
        continueAction: 'Parhau'
      }
    }),
  newAccount: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Waste receiving account',
        heading: heading('Waste receiving account', null, organisationName),
        switchOrganisation: {
          heading: 'Switch or add an organisation',
          description:
            'You can have more than one waste receiving organisation on your account.',
          switchLinkText: 'Switch organisation',
          switchLinkSuffix: 'to change account or',
          addLinkText: 'add an organisation',
          addLinkSuffix: 'if you want to register a new one.'
        },
        importantNotice: {
          title: 'Important',
          heading: `You need to pay your annual service charge for ${organisationName || '[Waste receiving organisation or business name]'} before you can report your waste movements.`,
          bodyPrefix: 'You can still',
          manageApiCode: 'manage your API code',
          bodySuffix:
            ', but you will not be able to use it to send data to the regulators.'
        },
        cards: {
          reportWaste: {
            text: 'Report receipt of waste',
            description:
              'Upload a spreadsheet or connect your software to report your waste movements.',
            links: {
              connectYourSoftware: 'Manage my API code',
              downloadSpreadsheet: 'Download spreadsheet template',
              uploadSpreadsheet: 'Upload a spreadsheet',
              updateSpreadsheet:
                'Upload a spreadsheet that has Waste tracking IDs'
            }
          },
          serviceCharge: {
            text: 'Service charge',
            description: 'Pay your annual service charge to use this service.',
            tag: 'Due October 2026',
            paymentDueTag: 'Payment due',
            payServiceCharge: 'Pay service charge',
            paidTag: 'Paid',
            nextPaymentDue: 'Next payment due October 2027'
          }
        }
      },
      cy: {
        title: 'qqqqq',
        heading: heading('qqqqq', null, organisationName),
        switchOrganisation: {
          heading: 'qqqqq',
          description: 'qqqqq',
          switchLinkText: 'qqqqq',
          switchLinkSuffix: 'qqqqq',
          addLinkText: 'qqqqq',
          addLinkSuffix: 'qqqqq'
        },
        importantNotice: {
          title: 'qqqqq',
          heading: 'qqqqq',
          bodyPrefix: 'qqqqq',
          manageApiCode: 'qqqqq',
          bodySuffix: 'qqqqq'
        },
        cards: {
          reportWaste: {
            text: 'qqqqq',
            description: 'qqqqq',
            links: {
              connectYourSoftware: 'qqqqq',
              downloadSpreadsheet: 'qqqqq',
              uploadSpreadsheet: 'qqqqq',
              updateSpreadsheet: 'qqqqq'
            }
          },
          serviceCharge: {
            text: 'qqqqq',
            description: 'qqqqq',
            tag: 'qqqqq',
            paymentDueTag: 'qqqqq',
            payServiceCharge: 'qqqqq',
            paidTag: 'qqqqq',
            nextPaymentDue: 'qqqqq'
          }
        }
      }
    }),
  manageAccount: (request) =>
    getContentForLanguage(request, {
      en: {
        navigationLink: 'Manage Defra account'
      },
      cy: {
        navigationLink: 'Manage Defra account'
      }
    })
}
