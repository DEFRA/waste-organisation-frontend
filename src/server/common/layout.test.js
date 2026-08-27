import { JSDOM } from 'jsdom'

import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('layout content', () => {
  let server
  const englishLayout = content.layout({ locale: 'en' })
  const welshLayout = content.layout({ locale: 'cy' })

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server?.stop({ timeout: 0 })
  })

  test('renders English layout by default', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

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
})

function footerLinkText(document, href) {
  return document
    .querySelector(`.govuk-footer a[href="${href}"]`)
    ?.textContent.trim()
}
