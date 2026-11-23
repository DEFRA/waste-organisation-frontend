// @vitest-environment jsdom
import {
  CONSENT_COOKIE_NAME,
  consentChoice,
  getCookie,
  setCookie,
  getAnalyticsConsent,
  setAnalyticsConsent,
  loadGoogleAnalytics,
  deleteAnalyticsCookies,
  applyConsent,
  reloadWithConfirmation,
  takeConfirmation
} from './cookie-functions.js'

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=; path=/; max-age=0`
  })
}

describe('cookie-functions', () => {
  beforeEach(() => {
    clearCookies()
    document.head.innerHTML = ''
  })

  describe('getCookie / setCookie', () => {
    test('round-trips a value, encoding and decoding it', () => {
      setCookie('example', 'a value')

      expect(document.cookie).toContain('example=a%20value')
      expect(getCookie('example')).toBe('a value')
    })

    test('returns null when the cookie is absent', () => {
      expect(getCookie('missing')).toBeNull()
    })

    test('reads the right cookie when several are set', () => {
      setCookie('first', 'one')
      setCookie('second', 'two')

      expect(getCookie('second')).toBe('two')
    })

    test('marks the cookie Secure on https but not on http', () => {
      const writtenFor = (protocol) => {
        let written = ''
        setCookie('x', 'y', {
          location: { protocol },
          get cookie() {
            return written
          },
          set cookie(value) {
            written = value
          }
        })
        return written
      }

      expect(writtenFor('https:')).toContain('; Secure')
      expect(writtenFor('http:')).not.toContain('Secure')
    })
  })

  describe('analytics consent', () => {
    test('setAnalyticsConsent writes the choice to the consent cookie', () => {
      setAnalyticsConsent(consentChoice.accepted)

      expect(getCookie(CONSENT_COOKIE_NAME)).toBe('accepted')
      expect(getAnalyticsConsent()).toBe('accepted')
    })

    test('getAnalyticsConsent treats an unknown value as no choice', () => {
      setCookie(CONSENT_COOKIE_NAME, 'yes')

      expect(getAnalyticsConsent()).toBeNull()
    })
  })

  describe('deleteAnalyticsCookies', () => {
    test('expires GA cookies and leaves the rest alone', () => {
      document.cookie = '_ga=GA1.1.123; path=/'
      document.cookie = '_ga_ABC123=GS1.1.456; path=/'
      document.cookie = '_gid=GA1.1.789; path=/'
      document.cookie = '_gat_UA-1=1; path=/'
      document.cookie = 'session=keep; path=/'

      deleteAnalyticsCookies()

      expect(document.cookie).toBe('session=keep')
    })

    /*
     * jsdom doesn't enforce the rule that a non-Secure write can't overwrite a
     * Secure cookie, so these check the exact strings written instead.
     */
    const deletionsFor = (protocol) => {
      const written = []
      deleteAnalyticsCookies({
        location: { protocol, hostname: 'service.defra.gov.uk' },
        get cookie() {
          return '_ga=GA1.1.123'
        },
        set cookie(value) {
          written.push(value)
        }
      })
      return written
    }

    test('also expires them on every parent domain, where GA usually sets them', () => {
      expect(deletionsFor('https:')).toEqual([
        '_ga=; path=/; max-age=0; Secure',
        '_ga=; path=/; max-age=0; domain=.service.defra.gov.uk; Secure',
        '_ga=; path=/; max-age=0; domain=.defra.gov.uk; Secure',
        '_ga=; path=/; max-age=0; domain=.gov.uk; Secure',
        '_ga=; path=/; max-age=0; domain=.uk; Secure'
      ])
    })

    test('marks the deletions Secure on https but not on http', () => {
      expect(deletionsFor('https:').every((w) => w.endsWith('; Secure'))).toBe(
        true
      )
      expect(deletionsFor('http:').some((w) => w.includes('Secure'))).toBe(
        false
      )
    })
  })

  describe('applyConsent', () => {
    test('accepting saves the choice, loads GTM and needs no reload', () => {
      const win = { document }

      expect(applyConsent(consentChoice.accepted, 'GTM-TEST123', win)).toBe(
        false
      )
      expect(getAnalyticsConsent()).toBe('accepted')
      expect(document.querySelector('script[src*="gtm.js"]')).not.toBeNull()
    })

    test('rejecting saves the choice and deletes analytics cookies', () => {
      document.cookie = '_ga=GA1.1.123; path=/'
      const win = { document }

      expect(applyConsent(consentChoice.rejected, 'GTM-TEST123', win)).toBe(
        false
      )
      expect(getAnalyticsConsent()).toBe('rejected')
      expect(document.cookie).not.toContain('_ga=')
      expect(document.querySelector('script[src*="gtm.js"]')).toBeNull()
    })

    test('rejecting after GTM has loaded on this page needs a reload to stop it', () => {
      const win = { document }
      loadGoogleAnalytics('GTM-TEST123', win)

      expect(applyConsent(consentChoice.rejected, 'GTM-TEST123', win)).toBe(
        true
      )
    })
  })

  describe('reloadWithConfirmation / takeConfirmation', () => {
    beforeEach(() => {
      window.sessionStorage.clear()
    })

    test('reloads and leaves a one-time confirmation for the reloaded page', () => {
      const win = {
        sessionStorage: window.sessionStorage,
        location: { reload: vi.fn() }
      }

      reloadWithConfirmation(win)

      expect(win.location.reload).toHaveBeenCalledTimes(1)
      expect(takeConfirmation(win)).toBe(true)
      expect(takeConfirmation(win)).toBe(false)
    })

    test('still reloads when sessionStorage is unavailable', () => {
      const win = {
        get sessionStorage() {
          throw new Error('blocked')
        },
        location: { reload: vi.fn() }
      }

      reloadWithConfirmation(win)

      expect(win.location.reload).toHaveBeenCalledTimes(1)
      expect(takeConfirmation(win)).toBe(false)
    })
  })

  describe('loadGoogleAnalytics', () => {
    test('injects gtm.js for the given container id and seeds the dataLayer', () => {
      const win = { document }

      loadGoogleAnalytics('GTM-TEST123', win)

      const script = document.querySelector('script[src*="gtm.js"]')
      expect(script).not.toBeNull()
      expect(script.src).toBe(
        'https://www.googletagmanager.com/gtm.js?id=GTM-TEST123'
      )
      expect(script.async).toBe(true)
      expect(win.dataLayer).toEqual([
        expect.objectContaining({ event: 'gtm.js' })
      ])
    })

    test('does not inject twice', () => {
      const win = { document }

      loadGoogleAnalytics('GTM-TEST123', win)
      loadGoogleAnalytics('GTM-TEST123', win)

      expect(document.querySelectorAll('script[src*="gtm.js"]')).toHaveLength(1)
    })

    test('does nothing when no container id is given', () => {
      const win = { document }

      loadGoogleAnalytics(undefined, win)

      expect(document.querySelector('script[src*="gtm.js"]')).toBeNull()
      expect(win.__googleAnalyticsLoaded).toBeUndefined()
    })
  })
})
