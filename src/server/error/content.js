import { getContentForLanguage } from '../../config/content.js'

export const errors = {
  notFound: (request) =>
    getContentForLanguage(request, {
      en: {
        pageTitle: 'Page not found',
        message: 'Page not found'
      },
      cy: {
        pageTitle: 'Heb ganfod y dudalen',
        message: 'Heb ganfod y dudalen'
      }
    }),
  forbidden: (request) =>
    getContentForLanguage(request, {
      en: {
        pageTitle: 'Forbidden',
        message: 'Forbidden'
      },
      cy: {
        pageTitle: 'Gwaharddedig',
        message: 'Gwaharddedig'
      }
    }),
  badRequest: (request) =>
    getContentForLanguage(request, {
      en: {
        pageTitle: 'Bad Request',
        message: 'Bad Request'
      },
      cy: {
        pageTitle: 'Cais gwael',
        message: 'Cais gwael'
      }
    }),
  unexpected: (request) =>
    getContentForLanguage(request, {
      en: {
        pageTitle: 'Something went wrong',
        message: 'Something went wrong'
      },
      cy: {
        pageTitle: "Aeth rhywbeth o'i le",
        message: "Aeth rhywbeth o'i le"
      }
    }),
  internalServerError: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Sorry, there is a problem with the service',
        heading: 'Sorry, there is a problem with the service',
        body: 'Try again later.'
      },
      cy: {
        title: "Mae'n ddrwg gennym, mae problem gyda'r gwasanaeth",
        heading: "Mae'n ddrwg gennym, mae problem gyda'r gwasanaeth",
        body: 'Rhowch gynnig arall arni yn nes ymlaen.'
      }
    })
}
