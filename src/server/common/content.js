import { getContentForLanguage } from '../../config/content.js'

const cookieConsentEn = {
  /*
   * Cookie consent banner copy (partials/cookie-banner.njk). "heading" is
   * followed by the service name in the template. The accepted/rejected
   * confirmation is "accepted" or "rejected" followed by "changeSettings", which
   * wraps a link to the cookies page, hence its beforeLink/linkText/afterLink split.
   */
  cookieBanner: {
    heading: 'Cookies on',
    essential: 'We use some essential cookies to make this service work.',
    analytics:
      'We’d also like to use analytics cookies so we can understand how you use the service and make improvements.',
    accept: 'Accept analytics cookies',
    reject: 'Reject analytics cookies',
    viewCookies: 'View cookies',
    accepted: 'You’ve accepted analytics cookies.',
    rejected: 'You’ve rejected analytics cookies.',
    changeSettings: {
      beforeLink: 'You can ',
      linkText: 'change your cookie settings',
      afterLink: ' at any time.'
    },
    hide: 'Hide cookie message'
  },
  /*
   * Accept/reject analytics section on the cookies page (partials/cookie-settings.njk)
   * and its confirmation (partials/cookie-settings-confirmation.njk).
   */
  cookieSettings: {
    heading: 'Analytics cookies (optional)',
    intro:
      'We use analytics cookies so we can understand how you use the service and make improvements.',
    legend: 'Do you want to accept analytics cookies?',
    accept: 'Use cookies that measure my website use',
    reject: 'Do not use cookies that measure my website use',
    save: 'Save cookie settings',
    confirmation: 'You’ve set your cookie preferences.',
    /*
     * The cookies Google Analytics 4 sets once analytics are accepted, listed so
     * users know what's stored (PECR). GA4 only sets _ga and _ga_<container-id>:
     * _gid and _gat are Universal Analytics cookies, which we don't use.
     */
    tableHead: { name: 'Name', purpose: 'Purpose', expires: 'Expires' },
    analyticsCookies: [
      {
        name: '_ga',
        purpose:
          'Checks if you’ve visited this service before. This helps us count how many people visit the service',
        expires: '2 years'
      },
      {
        name: '_ga_<container-id>',
        purpose:
          'Used by Google Analytics to find and track an individual session with your device',
        expires: '2 years'
      }
    ],
    // Essential, so listed with the other essential cookies on the cookies page.
    consentCookie: {
      name: 'cookie_preferences_set',
      purpose: 'Saves your cookie consent settings',
      expires: '1 year'
    }
  }
}

/* v8 ignore next */
export const common = {
  layout: (request) =>
    getContentForLanguage(request, {
      en: {
        phaseBanner: {
          tag: 'Beta',
          beforeLink: 'This is a new service. Help us improve it and ',
          linkText: 'give your feedback (opens in new tab)',
          afterLink: '.'
        },
        back: 'Back',
        languageToggle: {
          ariaLabel: 'Change language',
          english: 'English',
          welsh: 'Cymraeg',
          changeToEnglish: 'Change to English',
          changeToWelsh: 'Newid i Gymraeg'
        },
        footer: {
          privacy: 'Privacy',
          cookies: 'Cookies',
          accessibility: 'Accessibility statement',
          terms: 'Terms'
        },
        licence: {
          beforeLink: 'All content is available under the ',
          linkText: 'Open Government Licence v3.0',
          afterLink: ', except where otherwise stated'
        },
        copyright: '© Crown copyright',
        ...cookieConsentEn
      },
      cy: {
        phaseBanner: {
          tag: 'Beta',
          beforeLink: "Mae hwn yn wasanaeth newydd. Helpwch ni i'w wella drwy ",
          linkText: "roi'ch adborth (yn agor mewn tab newydd)",
          afterLink: '.'
        },
        back: 'Yn ôl',
        languageToggle: {
          ariaLabel: 'Newid iaith',
          english: 'English',
          welsh: 'Cymraeg',
          changeToEnglish: 'Change to English',
          changeToWelsh: 'Newid i Gymraeg'
        },
        footer: {
          privacy: 'Preifatrwydd',
          cookies: 'Cwcis',
          accessibility: 'Datganiad hygyrchedd',
          terms: 'Telerau'
        },
        licence: {
          beforeLink: "Mae'r holl gynnwys ar gael dan y ",
          linkText: 'Drwydded Llywodraeth Agored 3.0',
          afterLink: ' ac eithrio pan nodir fel arall'
        },
        copyright: '© Hawlfraint y Goron',
        /*
         * TODO: Welsh translation needed. Until then this reuses the English cookie
         * copy, so it can't drift from it; replace it with a Welsh copy of
         * cookieConsentEn's shape.
         */
        ...cookieConsentEn
      }
    })
}
