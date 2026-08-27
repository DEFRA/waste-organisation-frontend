import { getContentForLanguage } from '../../config/content.js'

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
          changeToWelsh: 'zzzzz'
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
        copyright: '© Crown copyright'
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
          ariaLabel: 'zzzzz',
          english: 'English',
          welsh: 'Cymraeg',
          changeToEnglish: 'Change to English',
          changeToWelsh: 'zzzzz'
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
        copyright: '© Hawlfraint y Goron'
      }
    })
}
