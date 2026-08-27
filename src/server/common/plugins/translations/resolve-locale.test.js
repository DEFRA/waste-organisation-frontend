import {
  DEFAULT_LOCALE,
  firstSupportedLocale,
  getBrowserLanguage,
  resolveLocale,
  supportedLocale
} from './resolve-locale.js'

describe('#supportedLocale', () => {
  test.each(['en', 'EN', ' en ', 'cy', 'CY'])(
    'accepts supported locale %j',
    (value) => {
      expect(supportedLocale(value)).toBe(value.trim().toLowerCase())
    }
  )

  test.each([undefined, null, '', 'fr', 'en-GB', 'zz', 1])(
    'rejects unsupported value %j',
    (value) => {
      expect(supportedLocale(value)).toBeUndefined()
    }
  )
})

describe('#firstSupportedLocale', () => {
  test('returns the first supported value from an array', () => {
    expect(firstSupportedLocale(['fr', 'cy', 'en'])).toBe('cy')
  })

  test('returns a supported string value', () => {
    expect(firstSupportedLocale('en')).toBe('en')
  })

  test('returns undefined when nothing is supported', () => {
    expect(firstSupportedLocale(['fr', 'de'])).toBeUndefined()
  })
})

describe('#getBrowserLanguage', () => {
  test('returns undefined when the header is missing or empty', () => {
    expect(getBrowserLanguage()).toBeUndefined()
    expect(getBrowserLanguage('')).toBeUndefined()
  })

  test('returns the highest-priority supported language', () => {
    expect(getBrowserLanguage('cy,en;q=0.8')).toBe('cy')
    expect(getBrowserLanguage('en-GB,cy;q=0.9')).toBe('en')
    expect(getBrowserLanguage('fr,cy-GB;q=0.8,en;q=0.5')).toBe('cy')
  })

  test('ignores unsupported languages', () => {
    expect(getBrowserLanguage('fr,de;q=0.9')).toBeUndefined()
  })
})

describe('#resolveLocale', () => {
  test('defaults to English', () => {
    expect(resolveLocale()).toBe(DEFAULT_LOCALE)
    expect(resolveLocale({})).toBe('en')
  })

  test('prefers a valid query param over cookie and Accept-Language', () => {
    expect(
      resolveLocale({
        queryLang: 'en',
        cookieLang: 'cy',
        acceptLanguage: 'cy'
      })
    ).toBe('en')
  })

  test('uses the cookie when the query param is missing or invalid', () => {
    expect(
      resolveLocale({
        queryLang: 'fr',
        cookieLang: 'cy',
        acceptLanguage: 'en'
      })
    ).toBe('cy')
  })

  test('uses Accept-Language when query and cookie are not valid', () => {
    expect(
      resolveLocale({
        queryLang: 'zz',
        cookieLang: 'nope',
        acceptLanguage: 'cy-GB,en;q=0.8'
      })
    ).toBe('cy')
  })

  test('uses the first valid query value when multiple are provided', () => {
    expect(resolveLocale({ queryLang: ['fr', 'cy'] })).toBe('cy')
  })
})
