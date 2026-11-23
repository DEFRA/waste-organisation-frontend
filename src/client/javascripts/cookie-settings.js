import {
  getAnalyticsConsent,
  applyConsent,
  reloadWithConfirmation,
  takeConfirmation
} from './cookie-functions.js'

/*
 * Controls the accept/reject analytics section on the cookies page.
 *
 * The section is rendered hidden and only revealed here, so users without
 * JavaScript never see a form that couldn't do anything for them (no analytics
 * without JS anyway). On load, the radios are pre-selected from the
 * saved choice. Saving records the choice, (de)activates analytics, and reveals the
 * "preferences saved" confirmation at the top of the page without a page submit -
 * or, when the page has to reload first, after the reload.
 *
 * This file is its own webpack entry, loaded only by partials/cookie-settings.njk,
 * and runs initCookieSettings() on load (see the call at the end). For safety it
 * does nothing on any page without the section, so loading it elsewhere would be
 * harmless.
 */

function showConfirmation(doc) {
  const confirmation = doc.querySelector('[data-cookie-settings-confirmation]')
  confirmation.hidden = false
  confirmation.focus()
}

export function initCookieSettings(win = window) {
  const doc = win.document
  const settings = doc.querySelector('[data-module="app-cookie-settings"]')

  if (!settings) {
    return
  }

  settings.hidden = false

  const gtmId = settings.dataset.gtmId
  const consent = getAnalyticsConsent(doc)

  // Pre-select the radio matching the saved choice, if any.
  if (consent) {
    settings.querySelector(
      `input[name="cookies[analytics]"][value="${consent}"]`
    ).checked = true
  }

  // Set by reloadWithConfirmation, from either this form or the banner.
  if (takeConfirmation(win)) {
    showConfirmation(doc)
  }

  settings.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()

    const selected = settings.querySelector(
      'input[name="cookies[analytics]"]:checked'
    )
    if (!selected) {
      return
    }

    // The radio values are the consentChoice values (see the template).
    if (applyConsent(selected.value, gtmId, win)) {
      reloadWithConfirmation(win)
      return
    }

    /*
     * If the banner is also on this page (a first-time visitor who hasn't chosen
     * yet), hide it: the choice has just been made here, so the banner shouldn't
     * stay on screen still asking the question.
     */
    const banner = doc.querySelector('[data-module="app-cookie-banner"]')
    if (banner) {
      banner.hidden = true
    }

    showConfirmation(doc)
  })
}

initCookieSettings()
