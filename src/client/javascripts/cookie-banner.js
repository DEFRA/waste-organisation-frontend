import {
  consentChoice,
  getAnalyticsConsent,
  loadGoogleAnalytics,
  applyConsent,
  reloadWithConfirmation
} from './cookie-functions.js'

/*
 * Drives the cookie consent banner rendered by partials/cookie-banner.njk.
 *
 * The banner markup is always hidden to start with. On load we unhide it for users
 * who haven't chosen yet, load Google Tag Manager straight away for users who
 * have already accepted cookies, and do nothing for users who rejected them.
 * Accepting or rejecting records the choice, activates analytics if accepted, and swaps
 * the question for a confirmation message - except on the page that also shows the
 * cookie-settings form (i.e. the cookies page /cookies), where we reload instead so its
 * radio buttons reflect the new choice, and it shows its own confirmation instead.
 */

function handleChoice(banner, gtmId, choice, win) {
  const needsReload = applyConsent(choice, gtmId, win)

  /*
   * When a cookie-settings form is also on the page, the banner sits above a
   * radio form showing the same choice, so reload to keep the two in step. We
   * detect the form's presence, rather than a particular URL, so the banner
   * doesn't need to know which route renders it.
   */
  if (
    needsReload ||
    win.document.querySelector('[data-module="app-cookie-settings"]')
  ) {
    reloadWithConfirmation(win)
    return
  }

  banner.querySelector('[data-cookie-message="question"]').hidden = true

  /*
   * Move focus to the confirmation so screen readers announce it (it carries
   * role="alert" and tabindex="-1"), as the GOV.UK cookie-banner guidance requires.
   */
  const confirmation = banner.querySelector(`[data-cookie-message="${choice}"]`)
  confirmation.hidden = false
  confirmation.focus()
}

export function initCookieBanner(win = window) {
  const banner = win.document.querySelector('[data-module="app-cookie-banner"]')

  if (!banner) {
    return
  }

  const gtmId = banner.dataset.gtmId
  const consent = getAnalyticsConsent(win.document)

  if (consent === consentChoice.accepted) {
    loadGoogleAnalytics(gtmId, win)
  } else if (!consent) {
    // No choice made yet, so show the banner and ask.
    banner.hidden = false
  }

  banner.querySelectorAll('[data-cookie-banner-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.cookieBannerAction

      if (action === 'hide') {
        banner.hidden = true
        return
      }

      handleChoice(
        banner,
        gtmId,
        action === 'accept' ? consentChoice.accepted : consentChoice.rejected,
        win
      )
    })
  })
}
