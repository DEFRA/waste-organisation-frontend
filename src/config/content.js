import { config } from './config.js'

const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

const formatPounds = (amountInPence) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amountInPence / 100)

const getContentForLanguage = (_request, data) => {
  return data['en']
}

export const content = {
  ukPermit: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'ukPermit',
        heading: heading(
          'Do you operate one or more licensed or permitted waste receiving sites?',
          null,
          null
        ),
        questions: {
          yes: 'Yes',
          no: 'No'
        },
        error: {
          title: 'There is a problem',
          message:
            'Select Yes if you operate one or more licensed or permitted waste receiving sites.'
        },
        continueAction: 'Continue'
      }
    }),
  cannotUseService: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Sorry, you cannot use the service',
        heading: heading(
          'Sorry, you cannot use the service',
          'Based on your answer, you cannot use this service as you do not operate any businesses or organisations that receive waste.',
          null
        ),
        link: {
          href: '/',
          text: 'Find out more about Digital waste tracking'
        }
      }
    }),
  nextAction: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Next Action',
        heading: heading('Report receipt of waste', null, organisationName),
        questions: {
          connectYourSoftware: 'Manage my API code',
          downloadSpreadsheet: 'Download spreadsheet template',
          uploadSpreadsheet: 'Upload a spreadsheet',
          updateSpreadsheet: 'Upload a spreadsheet that has Waste tracking IDs',
          changeWasteReceiver: 'Choose another waste receiver in my account'
        },
        error: {
          title: 'There is a problem',
          message: '[REAL TEXT GOES HERE]'
        },
        continueAction: 'Continue'
      }
    }),
  apiList: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'API Code',
        heading: heading('Your API code', null, organisationName),
        noEnabledApiCodes: 'You have no API codes',
        additionalCode: {
          title: 'Do you need to create an additional API code?',
          content:
            'If you work with multiple software providers, you should give each one an API code.',
          action: {
            additional: 'Create additional code',
            new: 'Create new code'
          }
        },
        disabledSuccessMessage: () => ({
          title: 'We have disabled this code',
          description: {
            pre: 'The code',
            post: 'cannot be used to send any new waste movements.'
          }
        }),
        returnAction: `Return to ${organisationName}`
      }
    }),
  apiDisable: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Disable API',
        heading: heading(
          'Do you want to disable this API code?',
          null,
          organisationName
        ),
        caption: {
          pre: 'If you agree this code',
          post: 'will no longer work.'
        },
        warning:
          'You will not be able to use this code to send any new waste movements.',
        questions: {
          yes: 'Yes',
          no: 'No'
        },
        error: {
          title: 'There is a problem',
          message: 'Select Yes if want to disable this API code.'
        },
        continueAction: 'Continue'
      }
    }),
  spreadsheetUpload: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Upload spreadsheet',
        heading: heading(
          'Upload a receipt of waste movement spreadsheet',
          null,
          organisationName
        ),
        error: {
          title: 'There is a problem',
          message: '[REAL TEXT GOES HERE]'
        },
        continueAction: 'Upload'
      }
    }),
  spreadsheetUploaded: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Upload spreadsheet',
        heading: heading('Spreadsheet upload successful', null, null),
        content: {
          heading: 'What happens next',
          text: [
            'We have received your receipt of waste spreadsheet.',
            'We need to check for viruses and errors.',
            'Once we complete the checks, we will send you a confirmation email.'
          ]
        },
        returnLink: `Return to ${organisationName}`
      }
    }),
  updateSpreadsheetUpload: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Update an existing spreadsheet',
        heading: heading(
          'Update an existing spreadsheet',
          null,
          organisationName
        ),
        description:
          'You will only be able to update an existing spreadsheet if you have been given a Waste Tracking ID for that waste movement.',
        continueAction: 'Continue'
      }
    }),
  updateSpreadsheetUploaded: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Update spreadsheet',
        heading: heading('Spreadsheet update successful', null, null),
        content: {
          heading: 'What happens next',
          text: [
            'We have received your updated receipt of waste spreadsheet.',
            'We need to check for viruses and errors.',
            'Once we complete the checks, we will send you a confirmation email.'
          ]
        },
        returnLink: `Return to ${organisationName}`
      }
    }),
  downloadSpreadsheet: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Download spreadsheet',
        heading: heading(
          'Download Receipt of waste spreadsheet',
          null,
          organisationName
        ),
        body: 'If you do not have the software needed to use the API, download the spreadsheet to report your waste.',
        downloadButton: 'Download spreadsheet',
        fileMetadata: 'XLSX, 1.1MB',
        returnLink: `Return to ${organisationName}`
      }
    }),
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
            tag: 'Due October 2026',
            paymentDueTag: 'Payment due',
            paidTag: 'Paid',
            nextPaymentDue: 'Next payment due October 2027'
          }
        }
      }
    }),
  serviceCharge: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Pay annual report receipt of waste service charge',
        heading: 'Pay the annual report receipt of waste service charge',
        cost: `The cost is ${formatPounds(config.get('govPay.serviceChargeAmountPence'))} per organisation.`,
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
        heading: 'Annual Report receipt of waste charge',
        intro:
          'Once you have paid the service charge, your organisation will have full access to report waste movements until',
        accessUntil: '11:59pm on Thursday 10 September 2026',
        sectionHeading: 'Review the payment amount',
        organisation: {
          heading: 'Organisation',
          nameLabel: 'Name',
          name:
            organisationName ||
            '[Waste receiving organisation or business name]',
          totalCostLabel: 'Total cost',
          totalCost: formatPounds(config.get('govPay.serviceChargeAmountPence'))
        },
        continue: 'Continue',
        cancel: 'Cancel'
      }
    }),
  paymentDetails: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Payment confirmation',
        heading: 'Payment confirmation',
        referenceLabel: 'Your payment reference',
        summaryHeading: 'Payment summary',
        paymentForLabel: 'Payment for',
        paymentForValue: 'Report receipt of waste annual service charge',
        organisationLabel: 'Organisation',
        organisationPlaceholder:
          '[Waste receiving organisation or business name]',
        totalAmountLabel: 'Total amount',
        whatHappensNextHeading: 'What happens next',
        whatHappensNext: [
          'You will receive an email confirming your payment.',
          'You can now use the service to report your waste movements.'
        ],
        returnToAccountPrefix: 'Return to',
        returnToAccountSuffix: 'waste receiving account'
      }
    }),
  cookies: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Cookies',
        heading: 'Cookies',
        introParagraph:
          'This service puts small files (known as cookies) onto your computer. These cookies are used to make the service work and cannot be turned off.',
        essentialCookiesHeading: 'Essential cookies',
        essentialCookiesDescription:
          'Essential cookies keep your information secure while you use this service. We do not need to ask permission to use them.',
        cookieTable: {
          head: [{ text: 'Name' }, { text: 'Purpose' }, { text: 'Expires' }],
          rows: [
            [
              { text: 'userSession' },
              { text: 'Keeps you signed in' },
              { text: '4 hours' }
            ],
            [
              { text: 'session' },
              { text: 'Stores session data' },
              { text: '4 hours' }
            ],
            [
              { text: 'bell-defraId' },
              { text: 'Used to sign in with Defra ID' },
              { text: 'When you close your browser' }
            ]
          ]
        }
      }
    }),
  unauthorized: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You do not have permission to view this page',
        heading: 'You do not have permission to view this page',
        reasons: ['you are not signed in', 'your session expired'],
        reasonsIntro: 'This could be because:',
        action:
          'Try signing in again or contact the support team for more help.',
        signInButton: 'Sign in'
      }
    }),
  signOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You are being signed out',
        heading: 'You are being signed out',
        fallbackLink: 'Continue signing out',
        navigationLink: 'Sign out'
      }
    }),
  signedOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You have been signed out',
        heading: 'You have been signed out',
        signInButton: 'Sign in'
      }
    }),
  privacyNotice: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Privacy notice',
        heading: 'Waste tracking receipt of waste beta phase privacy notice',
        introParagraph:
          'This privacy notice explains how the Waste Tracking service in the beta testing phase for the receipt of waste release will use and manage your personal data. If you have any queries about the content of this privacy notice, please email <a class="govuk-link" href="mailto:WasteTracking_Testing@defra.gov.uk">WasteTracking_Testing@defra.gov.uk</a>.',
        sections: [
          {
            heading: 'Who collects your personal data',
            body: '<p class="govuk-body"><a class="govuk-link" href="https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs">Department for Environment, Food and Rural Affairs</a> (Defra) is the controller for the personal data we collect.</p><p class="govuk-body">If you need further information about how Defra uses your personal data and your associated rights you can contact the Defra data protection manager at <a class="govuk-link" href="mailto:data.protection@defra.gov.uk">data.protection@defra.gov.uk</a>.</p><p class="govuk-body">The data protection officer for Defra is responsible for checking that Defra complies with legislation. You can contact them at <a class="govuk-link" href="mailto:DefraGroupDataProtectionOfficer@defra.gov.uk">DefraGroupDataProtectionOfficer@defra.gov.uk</a>.</p>'
          },
          {
            heading: 'What personal data we collect and how it is used',
            body: '<p class="govuk-body">We collect your:</p><ul class="govuk-list govuk-list--bullet"><li>Name</li><li>Contact details</li><li>Vehicle registration</li></ul><p class="govuk-body">This information is central to the digital Waste Tracking service so we understand the operators who have been responsible for transporting and treating or disposing of the waste that they have received.</p><p class="govuk-body">In this testing phase, we are collecting the information to understand the usability and performance of the digital service, to assess the quality of the information provided, gather feedback to inform any necessary service design updates, issue invites to user research and provide service updates.</p>'
          },
          {
            heading:
              'How your personal data has been obtained, if from a third party',
            body: '<p class="govuk-body">We may have obtained your data from permitted waste receivers who are responsible for providing information on the waste carrier/broker/dealer organisation that has transported the waste to them or been responsible for arranging the waste movement.</p>'
          },
          {
            heading: 'Lawful basis for processing your personal data',
            body: '<p class="govuk-body">The lawful basis for processing your personal data is that it is necessary for the performance of a public task. The Environmental Protection Act 1990 is the relevant primary legislation relevant to the public task <a class="govuk-link" href="https://www.legislation.gov.uk/ukpga/1990/43/contents">https://www.legislation.gov.uk/ukpga/1990/43/contents</a>. There is an amendment through the Environment Act of 2021 to add new powers under paragraph 34C for provisions on Waste Tracking <a class="govuk-link" href="https://www.legislation.gov.uk/ukpga/1990/43/part/II/crossheading/electronic-waste-tracking">https://www.legislation.gov.uk/ukpga/1990/43/part/II/crossheading/electronic-waste-tracking</a>.</p>'
          },
          {
            heading: 'Consent to process your personal data',
            body: '<p class="govuk-body">The processing of your personal data is not based on consent. You cannot withdraw it.</p>'
          },
          {
            heading: 'Who we share your personal data with',
            body: '<p class="govuk-body">We may share the personal data collected under this privacy notice with:</p><p class="govuk-body">Our four nation government and agency partners in the Waste Tracking project for the purpose of data quality assurance and feedback on the service to inform any further development or iteration of the service.</p><ul class="govuk-list govuk-list--bullet"><li>Environment Agency (EA)</li><li>Scottish Environment Protection Agency (SEPA)</li><li>Natural Resources Wales (NRW)</li><li>Northern Ireland Environment Agency (NIEA)</li><li>Welsh Government</li><li>Scottish Government</li><li>Northern Ireland Government</li></ul><p class="govuk-body">We respect your personal privacy when responding to access to information requests. We only share information when necessary to meet the statutory requirements of the Environmental Information Regulations 2004 and the Freedom of Information Act 2000.</p>'
          },
          {
            heading: 'How long we hold personal data',
            body: '<p class="govuk-body">We will keep your personal data for the duration of the beta testing phase of the project and into the early stages for transition into when the service becomes mandated for use and more established. We do not expect this to extend beyond October 2027.</p>'
          },
          {
            heading: 'What happens if you do not provide the personal data',
            body: '<p class="govuk-body">If you do not provide the personal data, the project team will not be able to take into account your experience or opinions to inform further development of the service. It may also limit our ability to invite you to participate in any other user research or to provide project or service updates on the project.</p>'
          },
          {
            heading: 'Use of automated decision-making or profiling',
            body: '<p class="govuk-body">The personal data you provide is not used for:</p><ul class="govuk-list govuk-list--bullet"><li>automated decision making (making a decision by automated means without any human involvement)</li><li>profiling (automated processing of personal data to evaluate certain things about an individual)</li></ul>'
          },
          {
            heading: 'Transfer of your personal data outside of the UK',
            body: '<p class="govuk-body">We will only transfer your personal data to another country that is deemed adequate for data protection purposes.</p>'
          },
          {
            heading: 'Your rights',
            body: '<p class="govuk-body">Based on the lawful processing above, your individual rights are:</p><ul class="govuk-list govuk-list--bullet"><li>The right to be informed</li><li>The right of access</li><li>The right to rectification</li><li>The right to restrict processing</li><li>The right to object</li><li>Rights in relation to automated decision making and profiling</li></ul><p class="govuk-body">More information about your <a class="govuk-link" href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/">individual rights</a> under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018 (DPA 2018).</p>'
          },
          {
            heading: 'Complaints',
            body: '<p class="govuk-body">You have the right to <a class="govuk-link" href="https://ico.org.uk/make-a-complaint/">make a complaint</a> to the Information Commissioner\'s Office at any time.</p>'
          },
          {
            heading: 'Personal information charter',
            body: '<p class="govuk-body">Our <a class="govuk-link" href="https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs/about/personal-information-charter">personal information charter</a> explains more about your rights over your personal data.</p>'
          }
        ]
      }
    }),
  terms: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Terms',
        heading: 'Terms',
        leadParagraph: 'By using this service you confirm:',
        conditions: [
          'you are authorised to act on behalf of your organisation',
          'the information you have given is complete and correct',
          "you understand your organisation's legal responsibility to provide this information",
          'you understand that giving false or misleading information may be a criminal offence'
        ],
        relatedContent: {
          heading: 'Related content',
          links: [
            { text: 'Privacy', href: '/privacy-notice' },
            { text: 'Cookies', href: '/cookies' },
            {
              text: 'Accessibility statement',
              href: 'https://www.gov.uk/help/accessibility-statement'
            }
          ]
        }
      }
    })
}
