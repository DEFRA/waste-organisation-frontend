import { account } from '../server/account/content.js'
import { apiManagement } from '../server/apiManagement/content.js'
import { onboarding } from '../server/onboarding/content.js'
import { serviceCharge } from '../server/serviceCharge/content.js'
import { paths } from './paths.js'

export const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

export const getContentForLanguage = (request, data) => {
  const locale = request.locale ?? 'en'
  return data[locale]
}

/* v8 ignore next */
export const content = {
  ...account,
  ...onboarding,
  ...apiManagement,
  ...serviceCharge,
  spreadsheetUpload: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Upload a receipt of waste movement spreadsheet',
        heading: heading(
          'Upload a receipt of waste movement spreadsheet',
          null,
          organisationName
        ),
        continueAction: 'Upload'
      }
    }),
  spreadsheetUploaded: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Spreadsheet uploaded',
        heading: heading('Spreadsheet uploaded', null, null),
        content: {
          heading: 'What happens next',
          text: [
            'We will check your spreadsheet for viruses and errors.',
            'You will then receive an email confirming whether the spreadsheet has been accepted or rejected.'
          ],
          referenceText: 'Spreadsheet reference:'
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
  downloadSpreadsheet: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Download Receipt of waste spreadsheet',
        heading: heading(
          'Download Receipt of waste spreadsheet',
          null,
          organisationName
        ),
        body: 'If you do not have the software needed to use the API, download the spreadsheet to report your waste.',
        downloadButton: 'Download spreadsheet',
        fileMetadata: 'XLSX, 428KB',
        returnLink: `Return to ${organisationName}`
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
  manageAccount: (request) =>
    getContentForLanguage(request, {
      en: {
        navigationLink: 'Manage Defra account'
      }
    }),

  organisationRequired: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You cannot continue on this service',
        heading: 'You cannot continue on this service',
        body: 'You will not be able to use this service because you have registered as an individual for personal use.',
        signOutInstruction:
          'If you want to continue, you will need to sign out, select the Receipt of waste service then register as a new user with a different email address.',
        registerInstruction:
          'Once you have created a new account, you can then register as a business or organisation.',
        signOutLinkText: 'Sign out',
        signOutUrl: paths.signOut
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
