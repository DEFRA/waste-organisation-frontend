// @vitest-environment jsdom
import { initCookieSettings } from './cookie-settings.js'
import { getAnalyticsConsent, consentChoice } from './cookie-functions.js'

const GTM_ID = 'GTM-TEST123'

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=; path=/; max-age=0`
  })
}

/*
 * Minimal stand-in for the markup partials/cookie-settings.njk and
 * partials/cookie-settings-confirmation.njk render. The server-side controller
 * test asserts the real templates carry these same data attributes.
 */
function renderSettings({ withBanner = false } = {}) {
  document.body.innerHTML = `
    ${withBanner ? '<div data-module="app-cookie-banner"></div>' : ''}
    <div data-cookie-settings-confirmation hidden tabindex="-1"></div>
    <div data-module="app-cookie-settings" data-gtm-id="${GTM_ID}" hidden>
      <form>
        <input type="radio" name="cookies[analytics]" value="accepted">
        <input type="radio" name="cookies[analytics]" value="rejected">
        <button>Save cookie settings</button>
      </form>
    </div>`
  return document.querySelector('[data-module="app-cookie-settings"]')
}

function makeWin() {
  return {
    document,
    sessionStorage: window.sessionStorage,
    location: { reload: vi.fn() }
  }
}

function radio(settings, value) {
  return settings.querySelector(`input[value="${value}"]`)
}

function save(settings) {
  settings.querySelector('button').click()
}

function confirmation() {
  return document.querySelector('[data-cookie-settings-confirmation]')
}

function gtmScript() {
  return document.querySelector('script[src*="gtm.js"]')
}

describe('initCookieSettings', () => {
  beforeEach(() => {
    clearCookies()
    window.sessionStorage.clear()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  test('does nothing when there is no settings section on the page', () => {
    expect(() => initCookieSettings(makeWin())).not.toThrow()
  })

  test('reveals the section, which is hidden for users without JavaScript', () => {
    const settings = renderSettings()

    initCookieSettings(makeWin())

    expect(settings.hidden).toBe(false)
  })

  test('pre-selects the saved choice', () => {
    const settings = renderSettings()
    document.cookie = `cookie_preferences_set=${consentChoice.rejected}; path=/`

    initCookieSettings(makeWin())

    expect(radio(settings, 'rejected').checked).toBe(true)
    expect(radio(settings, 'accepted').checked).toBe(false)
  })

  test('saving accept stores it, loads analytics, hides the banner and confirms', () => {
    const settings = renderSettings({ withBanner: true })
    const win = makeWin()
    initCookieSettings(win)

    radio(settings, 'accepted').checked = true
    save(settings)

    expect(getAnalyticsConsent()).toBe(consentChoice.accepted)
    expect(gtmScript()).not.toBeNull()
    expect(
      document.querySelector('[data-module="app-cookie-banner"]').hidden
    ).toBe(true)
    expect(confirmation().hidden).toBe(false)
    expect(document.activeElement).toBe(confirmation())
    expect(win.location.reload).not.toHaveBeenCalled()
  })

  test('saving reject after analytics loaded reloads to stop it, then confirms', () => {
    document.cookie = `cookie_preferences_set=${consentChoice.accepted}; path=/`
    const settings = renderSettings()
    const win = makeWin()
    win.__googleAnalyticsLoaded = true
    initCookieSettings(win)

    radio(settings, 'rejected').checked = true
    save(settings)

    expect(getAnalyticsConsent()).toBe(consentChoice.rejected)
    expect(win.location.reload).toHaveBeenCalledTimes(1)

    // The reloaded page shows the confirmation.
    renderSettings()
    initCookieSettings(makeWin())

    expect(confirmation().hidden).toBe(false)
  })

  test('saving with nothing selected does nothing', () => {
    const settings = renderSettings()
    initCookieSettings(makeWin())

    save(settings)

    expect(getAnalyticsConsent()).toBeNull()
    expect(confirmation().hidden).toBe(true)
  })

  test('does not confirm on an ordinary page load', () => {
    renderSettings()

    initCookieSettings(makeWin())

    expect(confirmation().hidden).toBe(true)
  })
})
