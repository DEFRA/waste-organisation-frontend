// @vitest-environment jsdom
import { initCookieBanner } from './cookie-banner.js'
import { getAnalyticsConsent, consentChoice } from './cookie-functions.js'

const GTM_ID = 'GTM-TEST123'

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=; path=/; max-age=0`
  })
}

/*
 * Minimal stand-in for the markup partials/cookie-banner.njk renders. The
 * server-side test asserts the real template carries these same data attributes,
 * so the two together cover template and behaviour without dependency.
 */
function renderBanner() {
  document.body.innerHTML = `
    <div data-module="app-cookie-banner" data-gtm-id="${GTM_ID}" hidden>
      <div data-cookie-message="question">
        <button type="button" data-cookie-banner-action="accept">Accept analytics cookies</button>
        <button type="button" data-cookie-banner-action="reject">Reject analytics cookies</button>
        <a href="/cookies">View cookies</a>
      </div>
      <div data-cookie-message="accepted" role="alert" tabindex="-1" hidden>
        <button type="button" data-cookie-banner-action="hide">Hide cookie message</button>
      </div>
      <div data-cookie-message="rejected" role="alert" tabindex="-1" hidden>
        <button type="button" data-cookie-banner-action="hide">Hide cookie message</button>
      </div>
    </div>`
  return document.querySelector('[data-module="app-cookie-banner"]')
}

function makeWin() {
  return {
    document,
    sessionStorage: window.sessionStorage,
    location: { reload: vi.fn() }
  }
}

function message(banner, name) {
  return banner.querySelector(`[data-cookie-message="${name}"]`)
}

function button(banner, action) {
  return banner.querySelector(`[data-cookie-banner-action="${action}"]`)
}

function gtmScript() {
  return document.querySelector('script[src*="gtm.js"]')
}

describe('initCookieBanner', () => {
  beforeEach(() => {
    clearCookies()
    window.sessionStorage.clear()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  test('does nothing when there is no banner on the page', () => {
    expect(() => initCookieBanner(makeWin())).not.toThrow()
    expect(gtmScript()).toBeNull()
  })

  test('shows the question to a visitor who has not chosen yet', () => {
    const banner = renderBanner()

    initCookieBanner(makeWin())

    expect(banner.hidden).toBe(false)
    expect(message(banner, 'question').hidden).toBe(false)
    expect(gtmScript()).toBeNull()
  })

  test('loads analytics and stays hidden for a returning visitor who accepted', () => {
    const banner = renderBanner()
    document.cookie = `cookie_preferences_set=${consentChoice.accepted}; path=/`

    initCookieBanner(makeWin())

    expect(gtmScript()).not.toBeNull()
    expect(banner.hidden).toBe(true)
  })

  test('loads nothing and stays hidden for a returning visitor who rejected', () => {
    const banner = renderBanner()
    document.cookie = `cookie_preferences_set=${consentChoice.rejected}; path=/`

    initCookieBanner(makeWin())

    expect(gtmScript()).toBeNull()
    expect(banner.hidden).toBe(true)
  })

  test('accepting stores the choice, loads analytics and confirms', () => {
    const banner = renderBanner()
    initCookieBanner(makeWin())

    button(banner, 'accept').click()

    expect(getAnalyticsConsent()).toBe(consentChoice.accepted)
    expect(gtmScript()).not.toBeNull()
    expect(message(banner, 'question').hidden).toBe(true)
    expect(message(banner, 'accepted').hidden).toBe(false)
    expect(banner.hidden).toBe(false)
    // Focus moves to the confirmation so assistive tech announces it.
    expect(document.activeElement).toBe(message(banner, 'accepted'))
  })

  test('rejecting stores the choice, loads no analytics and confirms', () => {
    const banner = renderBanner()
    initCookieBanner(makeWin())

    button(banner, 'reject').click()

    expect(getAnalyticsConsent()).toBe(consentChoice.rejected)
    expect(gtmScript()).toBeNull()
    expect(message(banner, 'rejected').hidden).toBe(false)
    expect(message(banner, 'question').hidden).toBe(true)
  })

  test('hiding the confirmation hides the whole banner', () => {
    const banner = renderBanner()
    initCookieBanner(makeWin())

    button(banner, 'accept').click()
    button(banner, 'hide').click()

    expect(banner.hidden).toBe(true)
  })

  test('reloads, asking the cookies page to confirm, when a settings form is also on the page', () => {
    const banner = renderBanner()
    // The cookies page renders both the banner and the settings section.
    banner.insertAdjacentHTML(
      'afterend',
      '<div data-module="app-cookie-settings"></div>'
    )
    const win = makeWin()
    initCookieBanner(win)

    button(banner, 'accept').click()

    expect(win.location.reload).toHaveBeenCalledTimes(1)
    expect(window.sessionStorage.getItem('cookie_preferences_saved')).toBe(
      'true'
    )
    expect(getAnalyticsConsent()).toBe(consentChoice.accepted)
    expect(gtmScript()).not.toBeNull()
    expect(message(banner, 'accepted').hidden).toBe(true)
  })

  test('shows the question again when the consent cookie holds an unknown value', () => {
    const banner = renderBanner()
    document.cookie = 'cookie_preferences_set=yes; path=/'

    initCookieBanner(makeWin())

    expect(banner.hidden).toBe(false)
    expect(gtmScript()).toBeNull()
  })

  test('deletes existing analytics cookies on reject', () => {
    const banner = renderBanner()
    document.cookie = '_ga=GA1.1.123; path=/'
    initCookieBanner(makeWin())

    button(banner, 'reject').click()

    expect(document.cookie).not.toContain('_ga=')
  })

  test('confirms (no reload) when no settings form is present', () => {
    const banner = renderBanner()
    const win = makeWin()
    initCookieBanner(win)

    button(banner, 'accept').click()

    expect(win.location.reload).not.toHaveBeenCalled()
    expect(message(banner, 'accepted').hidden).toBe(false)
  })
})
