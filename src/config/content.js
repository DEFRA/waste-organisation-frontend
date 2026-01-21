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
        heading: heading('What do you want to do?', null, organisationName),
        questions: {
          connectYourSoftware: 'Connect your software to the API',
          uploadSpreadsheet: 'Upload a new spreadsheet',
          updateSpreadsheet:
            'Update an existing waste movement in the spreadsheet',
          changeWasteReceiver: 'Choose another waste receiver in my account',
          addWasteReceiver: 'Add another waste receiver to my account'
        },
        error: {
          title: 'There is a problem',
          message: '[REAL TEXT GOES HERE]'
        },
        continueAction: 'Continue'
      }
    })
}
