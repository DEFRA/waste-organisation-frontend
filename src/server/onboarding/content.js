import { getContentForLanguage, heading } from '../../config/content.js'
import { paths } from '../../config/paths.js'

/* v8 ignore next */
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
      cy: {
        title: "Ydych chi'n cofrestru fel awdurdod lleol?",
        heading: heading(
          'Ydych chi’n cofrestru fel awdurdod lleol?',
          null,
          null
        ),
        questions: {
          yes: 'Ydw',
          no: 'Nac ydw'
        },
        error: {
          pageTitle: "Gwall: Ydych chi'n cofrestru fel awdurdod lleol?",
          title: 'Mae yna broblem',
          message: "ewiswch Ydw os ydych chi'n cofrestru fel awdurdod lleol"
        },
        continueAction: 'Parhau'
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
      },
      cy: {
        title: "Ydych chi'n cofrestru fel awdurdod lleol?",
        heading: heading(
          "Ydych chi'n cofrestru fel awdurdod lleol?",
          "Os ydych chi'n cofrestru fel awdurdod lleol ac nad oes gennych rif cofrestru cwmni, bydd angen ichi wneud y canlynol:",
          null
        ),
        steps: [
          `Dewis "Ydw" pan ofynnir ichi a ydych chi'n cofrestru fel busnes neu sefydliad.`,
          'Cadarnhau nad oes gennych chi rif cofrestru cwmni.',
          'Dewis "Unig fasnachwr" pan ofynnir ichi pa fath o fusnes neu sefydliad sydd gennych chi.'
        ],
        finalNote:
          'Cyn ichi fwrw ymlaen, edrychwch i weld a yw’ch awdurdod lleol wedi cael ei gofrestru’n barod. ',
        link: {
          href: paths.signinDefraIdCallback,
          text: 'Parhau'
        }
      }
    })
}
