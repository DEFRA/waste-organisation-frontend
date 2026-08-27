import { getContentForLanguage } from '../../config/content.js'
import { paths } from '../../config/paths.js'

// zzzzz marks strings that are not in the Welsh translation pack

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
        title: 'zzzzz',
        heading: 'zzzzz',
        fallbackLink: 'zzzzz',
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
        title: 'zzzzz',
        heading: 'zzzzz',
        signInButton: 'zzzzz'
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
        title: 'zzzzz',
        heading: 'zzzzz',
        reasons: ['zzzzz', 'zzzzz'],
        reasonsIntro: 'zzzzz',
        action: 'zzzzz',
        signInButton: 'zzzzz'
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
        title: 'zzzzz',
        heading: 'zzzzz',
        body: 'zzzzz',
        signOutInstruction: 'zzzzz',
        registerInstruction: 'zzzzz',
        signOutLinkText: 'Allgofnodi',
        signOutUrl: paths.signOut
      }
    })
}
