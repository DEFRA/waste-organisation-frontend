import { getContentForLanguage } from '../../config/content.js'

export const authentication = {
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
    })
}
