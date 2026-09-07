import { getContentForLanguage } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const authentication = {
  signOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You are being signed out',
        heading: 'You are being signed out',
        fallbackLink: 'Continue signing out',
        navigationLink: 'Sign out'
      },
      cy: {
        title: "Rydych chi wrthi'n cael eich allgofnodi",
        heading: "Rydych chi wrthi'n cael eich allgofnodi",
        fallbackLink: 'Parhau i fewngofnodi',
        navigationLink: 'Allgofnodi'
      }
    }),
  signedOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You have been signed out',
        heading: 'You have been signed out',
        signInButton: 'Sign in'
      },
      cy: {
        title: 'Rydych chi wedi cael eich allgofnodi',
        heading: 'Rydych chi wedi cael eich allgofnodi',
        signInButton: 'Mewngofnodi'
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
      },
      cy: {
        title: 'Does dim caniatâd gennych i weld y tudalen yma',
        heading: 'Does dim caniatâd gennych i weld y tudalen yma',
        reasons: [
          'dydych chi ddim wedi mewngofnodi',
          'daeth eich sesiwn i ben'
        ],
        reasonsIntro: 'Rhesymau posibl am hyn yw:',
        action:
          "Ceisiwch fewngofnodi eto neu cysylltwch â'r tîm cymorth i gael rhagor o help.",
        signInButton: 'Mewngofnodi'
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
      },
      cy: {
        title: 'Chewch chi ddim parhau ar y gwasanaeth yma',
        heading: 'Chewch chi ddim parhau ar y gwasanaeth yma',
        body: "Fyddwch chi ddim yn gallu defnyddio'r gwasanaeth yma am eich bod chi wedi cofrestru fel unigolyn at ddibenion personol.",
        signOutInstruction:
          'Os hoffech chi barhau, bydd angen ichi allgofnodi, dewis y gwasanaeth Derbyn gwastraff ac yna cofrestru fel defnyddiwr newydd gyda chyfeiriad ebost gwahanol.',
        registerInstruction:
          'Ar ôl ichi greu cyfrif newydd, cewch gofrestru wedyn fel busnes neu sefydliad.',
        signOutLinkText: 'Allgofnodi',
        signOutUrl: paths.signOut
      }
    })
}
