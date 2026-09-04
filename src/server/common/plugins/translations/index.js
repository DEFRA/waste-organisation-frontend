import { config } from '../../../../config/config.js'
import {
  DEFAULT_LOCALE,
  firstSupportedLocale,
  LANGUAGE_COOKIE_NAME,
  resolveLocale,
  supportedLocale
} from './resolve-locale.js'

const LANGUAGE_COOKIE_TTL_DAYS = 400
const LANGUAGE_COOKIE_TTL_MS = LANGUAGE_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000

export const translation = {
  plugin: {
    name: 'translation',
    register: async (server) => {
      server.state(LANGUAGE_COOKIE_NAME, {
        ttl: LANGUAGE_COOKIE_TTL_MS,
        isSecure: config.get('session.cookie.secure'),
        isHttpOnly: true,
        isSameSite: config.get('session.cookie.sameSite'),
        path: '/',
        encoding: 'none',
        clearInvalid: true
      })

      server.ext('onPreHandler', (request, h) => {
        if (!config.get('featureFlags.welshLanguage')) {
          request.locale = DEFAULT_LOCALE
          return h.continue
        }

        request.locale = resolveLocale({
          queryLang: request.query?.lang,
          cookieLang: request.state?.[LANGUAGE_COOKIE_NAME],
          acceptLanguage: request.headers['accept-language']
        })

        const queryLang = firstSupportedLocale(request.query?.lang)
        const cookieLang = supportedLocale(
          request.state?.[LANGUAGE_COOKIE_NAME]
        )

        const langToPersist = queryLang || cookieLang
        if (langToPersist) {
          h.state(LANGUAGE_COOKIE_NAME, langToPersist)
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
