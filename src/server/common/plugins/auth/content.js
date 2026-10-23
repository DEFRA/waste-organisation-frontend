import { getContentForLanguage, heading } from '../../../../config/content.js'

/* v8 ignore next */
export const login = {
  login: (request, loginPath) =>
    getContentForLanguage(request, {
      en: {
        heading: heading('Login form'),
        pageTitle: 'Login Form',
        action: {
          loginPath,
          text: 'Login',
          usernameLabel: 'Username',
          passwordLabel: 'Password',
          usernameHint: 'Environment access username',
          passwordHint: 'Environment access password'
        }
      },
      cy: {
        heading: heading('Ffurflen mewngofnodi'),
        pageTitle: 'Ffurflen mewngofnodi',
        action: {
          loginPath,
          text: 'Mewngofnodi',
          usernameLabel: 'Enw defnyddiwr',
          passwordLabel: 'Cyfrinair',
          usernameHint: 'Enw defnyddiwr mynediad amgylcheddol',
          passwordHint: 'Cyfrinair mynediad amgylchedd'
        }
      }
    })
}
