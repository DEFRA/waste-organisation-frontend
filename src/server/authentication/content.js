import { getContentForLanguage } from '../../config/content.js'

//TODO: not translated

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
    })
}
