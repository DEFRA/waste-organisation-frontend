import { getContentForLanguage, heading } from '../../config/content.js'

/* v8 ignore next */
export const apiManagement = {
  apiList: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Your API code',
        heading: heading('Your API code', null, organisationName),
        noEnabledApiCodes: 'You have no API codes',
        words: {
          copy: 'Copy',
          copied: 'Copied',
          code: 'code',
          disable: 'Disable',
          disabled: 'Disabled',
          change: 'Change',
          codeName: 'code name',
          name: 'Name',
          apiCode: 'API code'
        },
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
        returnAction: `Return to ${organisationName}`,
        changeName: {
          action: 'Change',
          hiddenText: 'name for'
        }
      },
      cy: {
        title: 'Eich cod API',
        heading: heading('Eich cod API', null, organisationName),
        noEnabledApiCodes: 'zzzzz',
        words: {
          copy: 'Copi',
          copied: 'zzzzz',
          code: 'cod',
          disable: 'Analluogi',
          disabled: "Wedi'i analluogi",
          change: 'Newid',
          codeName: 'zzzzz',
          name: 'Enw',
          apiCode: 'Cod API'
        },
        additionalCode: {
          title: 'Oes angen ichi greu cod API ychwanegol?',
          content:
            "Os ydych chi'n gweithio gyda mwy nag un darparwr meddalwedd, dylech roi cod API i bob un.",
          action: {
            additional: 'Creu cod ychwanegol',
            new: 'zzzzz'
          }
        },
        disabledSuccessMessage: () => ({
          title: 'We have disabled this code',
          description: {
            pre: 'The code',
            post: 'cannot be used to send any new waste movements.'
          }
        }),
        returnAction: `Dychwelyd i ${organisationName}`,
        changeName: {
          action: 'Newid',
          hiddenText: 'zzzzz'
        }
      }
    }),
  apiChangeName: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Change API code name',
        heading: heading('Change API code name', null, organisationName),
        label: 'API code name',
        hint: 'You can change the name of the API by overwriting the existing one.',
        error: {
          pageTitle: 'Error: Change API code name',
          title: 'There is a problem',
          message: 'Enter a name for your API code'
        },
        updateError: {
          title: 'There is a problem',
          message: 'The API code name could not be updated. Try again.'
        },
        saveAction: 'Save and continue'
      }
    }),
  apiDisable: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Do you want to disable this API code?',
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
          pageTitle: 'Error: Do you want to disable this API code?',
          title: 'There is a problem',
          message: 'Select Yes if want to disable this API code.'
        },
        continueAction: 'Continue'
      }
    })
}
