import { config } from '../../../../config/config.js'
import {
  firstSupportedLocale,
  LANGUAGE_COOKIE_NAME,
  resolveLocale
} from './resolve-locale.js'

export const translation = {
  plugin: {
    name: 'translation',
    register: async (server) => {
      server.state(LANGUAGE_COOKIE_NAME, {
        ttl: 400 * 24 * 60 * 60 * 1000,
        isSecure: config.get('session.cookie.secure'),
        isHttpOnly: true,
        isSameSite: config.get('session.cookie.sameSite'),
        path: '/',
        encoding: 'none',
        clearInvalid: true
      })

      server.ext('onPreHandler', (request, h) => {
        request.locale = resolveLocale({
          queryLang: request.query?.lang,
          cookieLang: request.state?.[LANGUAGE_COOKIE_NAME],
          acceptLanguage: request.headers['accept-language']
        })

        const queryLang = firstSupportedLocale(request.query?.lang)
        if (queryLang) {
          h.state(LANGUAGE_COOKIE_NAME, queryLang)
        }

        return h.continue
      })

      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.variety !== 'view') {
          return h.continue
        }

        response.source.context ??= {}

        response.source.context.locale = request.locale
        response.source.context.htmlLang = request.locale

        return h.continue
      })
    }
  }
}
