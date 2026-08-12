import { getContentForLanguage, heading } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const onboarding = {
  ukPermit: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Are you registering as a local authority?',
        heading: heading(
          'Are you registering as a local authority?',
          null,
          null
        ),
        questions: {
          yes: 'Yes',
          no: 'No'
        },
        error: {
          pageTitle: 'Error: Are you registering as a local authority?',
          title: 'There is a problem',
          message: 'Select Yes if you are registering as a local authority'
        },
        continueAction: 'Continue'
      },
      zz: {
        title: 'ZZZZ zzzz zzzz zzzz?',
        heading: heading('ZZZZ zzzz zzzz zzzz?', null, null),
        questions: {
          yes: 'ZZ',
          no: 'zz'
        },
        error: {
          pageTitle: 'Error: ZZZZ zzzz zzzz zzzz?',
          title: 'ZZZZ zzzz zzzz zzzz',
          message: 'ZZZZ zzzz zzzz zzzz'
        },
        continueAction: 'zzzzz'
      }
    }),
  localAuthorityGuidance: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Are you registering as a local authority?',
        heading: heading(
          'Are you registering as a local authority?',
          'If you are registering as a local authority and do not have a company registration number, you will need to:',
          null
        ),
        steps: [
          'Select "Yes" when asked if you are registering as a business or organisation.',
          'Confirm you do not have a company registration number.',
          'Select "Sole trader" when asked about what kind of business or organisation you have.'
        ],
        finalNote:
          'Before you continue, check if your local authority has already been registered.',
        link: {
          href: paths.signinDefraIdCallback,
          text: 'Continue'
        }
      }
    })
}
