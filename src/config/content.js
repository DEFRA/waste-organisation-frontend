const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

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
            { text: 'Privacy', href: 'https://www.gov.uk/help/privacy-notice' },
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
