import { getContentForLanguage, heading } from '../../config/content.js'

/* v8 ignore next */
export const account = {
  account: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Waste operator account',
        heading: heading('Waste operator account', null, organisationName),
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
            payNow: 'Talu nawr'
          }
        }
      }
    })
}
