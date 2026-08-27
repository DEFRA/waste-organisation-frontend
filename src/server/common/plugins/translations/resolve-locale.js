export const DEFAULT_LOCALE = 'en'
export const LANGUAGE_COOKIE_NAME = 'lang'
export const SUPPORTED_LOCALES = ['en', 'cy']

export function supportedLocale(value) {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalised = value.trim().toLowerCase()

  return SUPPORTED_LOCALES.includes(normalised) ? normalised : undefined
}

export function firstSupportedLocale(value) {
  const candidates = Array.isArray(value) ? value : [value]

  return candidates.map(supportedLocale).find(Boolean)
}

export function getBrowserLanguage(acceptLanguage = '') {
  return acceptLanguage
    .split(',')
    .map((item) => {
      const [locale, qualityValue = 'q=1'] = item.trim().split(';')

      return {
        language: locale.toLowerCase().split('-')[0],
        quality: Number(qualityValue.trim().replace('q=', '')) || 0
      }
    })
    .sort((a, b) => b.quality - a.quality)
    .map(({ language }) => supportedLocale(language))
    .find(Boolean)
}

export function resolveLocale({ queryLang, cookieLang, acceptLanguage } = {}) {
  return (
    firstSupportedLocale(queryLang) ||
    supportedLocale(cookieLang) ||
    getBrowserLanguage(acceptLanguage) ||
    DEFAULT_LOCALE
  )
}
