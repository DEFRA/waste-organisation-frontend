/*
 * Shared cookie consent helpers.
 *
 * Analytics cookies are optional, so Google Tag Manager only
 * load once the user has actively accepted. The user's choice is remembered in
 * the `cookie_preferences_set` cookie.
 *
 */

export const CONSENT_COOKIE_NAME = 'cookie_preferences_set'

// One year, the usual lifetime for a GOV.UK cookie-consent choice.
const CONSENT_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60

/*
 * Cookies Google Analytics sets once GTM runs: _ga and _ga_<container> (GA4), plus
 * _gid and _gat_* from older Universal Analytics tags, in case the container uses one.
 */
const ANALYTICS_COOKIE_PATTERN = /^(_ga($|_)|_gid$|_gat)/

/*
 * sessionStorage key telling the cookies page, after a reload, to show its
 * "you've set your cookie preferences" confirmation.
 */
const CONFIRMATION_STORAGE_KEY = 'cookie_preferences_saved'

export const consentChoice = {
  accepted: 'accepted',
  rejected: 'rejected'
}

export function getCookie(name, doc = document) {
  const prefix = `${name}=`

  const match = doc.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

export function setCookie(name, value, doc = document) {
  // Secure on HTTPS, omitted on localhost so the cookie still sets in dev.
  const secure = doc.location?.protocol === 'https:' ? '; Secure' : ''
  doc.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

/*
 * Returns 'accepted', 'rejected', or null when no valid choice has been made.
 * Anything else in the cookie (e.g. a value from an older format) counts as no
 * choice, so the user is asked again rather than silently never tracked.
 */
export function getAnalyticsConsent(doc = document) {
  const value = getCookie(CONSENT_COOKIE_NAME, doc)
  return Object.values(consentChoice).includes(value) ? value : null
}

export function setAnalyticsConsent(value, doc = document) {
  setCookie(CONSENT_COOKIE_NAME, value, doc)
}

/*
 * Delete the analytics cookies. GA sets them on the widest domain it can (e.g.
 * .defra.gov.uk when served from service.defra.gov.uk), and a cookie can only be
 * deleted with the domain it was set on, so expire each one on the bare host and
 * on every parent domain, the browser will ignore the attempts for domains that
 * don't apply.
 */
export function deleteAnalyticsCookies(doc = document) {
  const hostParts = (doc.location?.hostname ?? '').split('.')
  const domains = hostParts.map(
    (_, i) => `; domain=.${hostParts.slice(i).join('.')}`
  )

  doc.cookie
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter((name) => ANALYTICS_COOKIE_PATTERN.test(name))
    .forEach((name) => {
      ;['', ...domains].forEach((domain) => {
        doc.cookie = `${name}=; path=/; max-age=0${domain}`
      })
    })
}

/*
 * Load Google Tag Manager by fetching gtm.js from the GTM host. This avoids an
 * inline snippet (so the Content-Security-Policy can allow GTM by host rather
 * than by script hash).
 *
 * The "already loaded" flag lives on window rather than in this module because
 * webpack bundles this file into both application.js and cookie-settings.js, so
 * each bundle has its own copy of the module; window is what they share.
 */
export function loadGoogleAnalytics(gtmId, win = window) {
  if (!gtmId || win.__googleAnalyticsLoaded) {
    return
  }

  win.__googleAnalyticsLoaded = true
  win.dataLayer = win.dataLayer || []
  win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = win.document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  win.document.head.appendChild(script)
}

/*
 * Record a choice and act on it: accepting loads GTM, rejecting deletes any
 * analytics cookies already set. Returns true when the page must be reloaded to
 * honour the choice, i.e. the user rejected after GTM was already running here:
 * there's no way to unload a script, so it would keep tracking until the next page.
 */
export function applyConsent(choice, gtmId, win = window) {
  setAnalyticsConsent(choice, win.document)

  if (choice === consentChoice.accepted) {
    loadGoogleAnalytics(gtmId, win)
    return false
  }

  deleteAnalyticsCookies(win.document)
  return Boolean(win.__googleAnalyticsLoaded)
}

/*
 * Reload the page, asking the cookies page to show its confirmation once it has
 * reloaded. sessionStorage can be unavailable (e.g. blocked by privacy settings),
 * in which case the choice is still saved, just without the confirmation.
 */
export function reloadWithConfirmation(win = window) {
  try {
    win.sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, 'true')
  } catch {
    // Storage unavailable: reload anyway, without the confirmation.
  }
  win.location.reload()
}

/* True, once, after reloadWithConfirmation. */
export function takeConfirmation(win = window) {
  try {
    const pending = win.sessionStorage.getItem(CONFIRMATION_STORAGE_KEY)
    win.sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY)
    return pending === 'true'
  } catch {
    return false
  }
}
