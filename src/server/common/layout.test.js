import { JSDOM } from 'jsdom'

import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'
import { config } from '../../config/config.js'

describe('layout content', () => {
  let server
  let initialWelshLanguageFlag
  const englishLayout = content.layout({ locale: 'en' })
  const welshLayout = content.layout({ locale: 'cy' })

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    config.set('featureFlags.welshLanguage', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    await server?.stop({ timeout: 0 })
  })

  test('renders English layout by default', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document, Node } = new JSDOM(payload).window

    expect(document.documentElement.lang).toBe('en')
    expect(
      document.querySelector('[data-testid="feedback-link"]').textContent
    ).toBe(englishLayout.phaseBanner.linkText)
    expect(footerLinkText(document, '/privacy-notice')).toBe(
      englishLayout.footer.privacy
    )
    expect(footerLinkText(document, '/cookies')).toBe(
      englishLayout.footer.cookies
    )
    expect(payload).toContain(englishLayout.licence.linkText)
    expect(payload).toContain(englishLayout.copyright)

    const feedbackLink = document.querySelector('[data-testid="feedback-link"]')
    const languageToggle = document.querySelector(
      '[data-testid="language-toggle"]'
    )
    expect(
      Boolean(
        feedbackLink.compareDocumentPosition(languageToggle) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true)
  })

  test('renders Welsh layout when lang=cy', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(document.documentElement.lang).toBe('cy')
    expect(
      document.querySelector('[data-testid="feedback-link"]').textContent
    ).toBe(welshLayout.phaseBanner.linkText)
    expect(footerLinkText(document, '/privacy-notice')).toBe(
      welshLayout.footer.privacy
    )
    expect(footerLinkText(document, '/cookies')).toBe(
      welshLayout.footer.cookies
    )
    expect(footerLinkText(document, '/accessibility-statement')).toBe(
      welshLayout.footer.accessibility
    )
    expect(footerLinkText(document, '/terms')).toBe(welshLayout.footer.terms)
    expect(payload).toContain(welshLayout.licence.linkText)
    expect(payload).toContain(welshLayout.copyright)
  })

  test('renders a Welsh back link when lang=cy', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.ukPermit}?lang=cy`
    })

    const { document } = new JSDOM(payload).window
    const backLink = document.querySelector('[data-testid="back-link"]')

    expect(backLink.textContent.trim()).toBe(welshLayout.back)
  })

  test('renders English as text and Cymraeg as a link by default', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window
    const toggle = document.querySelector('[data-testid="language-toggle"]')
    const english = toggle.querySelector('[lang="en"]')
    const welsh = toggle.querySelector('[lang="cy"]')

    expect(english.tagName).toBe('SPAN')
    expect(english.getAttribute('aria-current')).toBe('true')
    expect(english.textContent.trim()).toBe('English')
    expect(welsh.tagName).toBe('A')
    expect(welsh.getAttribute('href')).toContain('lang=cy')
    expect(welsh.getAttribute('hreflang')).toBe('cy')
  })

  test('renders Cymraeg as text and English as a link when lang=cy', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?lang=cy`
    })

    const { document } = new JSDOM(payload).window
    const toggle = document.querySelector('[data-testid="language-toggle"]')
    const english = toggle.querySelector('[lang="en"]')
    const welsh = toggle.querySelector('[lang="cy"]')

    expect(welsh.tagName).toBe('SPAN')
    expect(welsh.getAttribute('aria-current')).toBe('true')
    expect(welsh.textContent.trim()).toBe('Cymraeg')
    expect(english.tagName).toBe('A')
    expect(english.getAttribute('href')).toContain('lang=en')
    expect(english.getAttribute('hreflang')).toBe('en')
  })

  test('keeps other query params on the language toggle href', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?foo=bar`
    })

    const { document } = new JSDOM(payload).window
    const welsh = document.querySelector(
      '[data-testid="language-toggle"] [lang="cy"]'
    )

    expect(welsh.getAttribute('href')).toContain('foo=bar')
    expect(welsh.getAttribute('href')).toContain('lang=cy')
  })

  test('hides the language toggle when welsh language is disabled', async () => {
    config.set('featureFlags.welshLanguage', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(document.querySelector('[data-testid="language-toggle"]')).toBeNull()

    config.set('featureFlags.welshLanguage', true)
  })
})

function footerLinkText(document, href) {
  return document
    .querySelector(`.govuk-footer a[href="${href}"]`)
    ?.textContent.trim()
}
