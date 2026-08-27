import { languageToggleHref } from './language-toggle-href.js'

describe('#languageToggleHref', () => {
  test('adds lang when the request has no query', () => {
    expect(languageToggleHref({ path: '/account' }, 'cy')).toBe(
      '/account?lang=cy'
    )
  })

  test('replaces an existing lang param', () => {
    expect(
      languageToggleHref({ path: '/account', query: { lang: 'cy' } }, 'en')
    ).toBe('/account?lang=en')
  })

  test('keeps other query params', () => {
    expect(
      languageToggleHref(
        { path: '/cookies', query: { foo: 'bar', lang: 'en' } },
        'cy'
      )
    ).toBe('/cookies?foo=bar&lang=cy')
  })

  test('keeps array query values', () => {
    expect(
      languageToggleHref(
        { path: '/search', query: { q: ['one', 'two'] } },
        'cy'
      )
    ).toBe('/search?q=one&q=two&lang=cy')
  })
})
