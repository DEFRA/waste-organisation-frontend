import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'

describe('#cookiesController', () => {
  let server
  let initialWelshLanguageFlag
  let initialGoogleAnalyticsFlag

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    initialGoogleAnalyticsFlag = config.get('featureFlags.googleAnalytics')
    server = await initialiseServer()
  })

  afterEach(() => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    config.set('featureFlags.googleAnalytics', initialGoogleAnalyticsFlag)
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    config.set('featureFlags.googleAnalytics', initialGoogleAnalyticsFlag)
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 with the correct page title', async () => {
    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.ok)
    expect(document.title).toEqual(expect.stringContaining('Cookies |'))
  })

  test('Should have a link to cookies in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(result).toEqual(expect.stringContaining('href="/cookies"'))
  })

  test('Should render the English cookies page', async () => {
    // Essential-cookies content only; the analytics banner/form have their own tests.
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Cookies |'))
    expect(document.querySelector('h1').textContent).toContain('Cookies')
    // Scope to main content: the cookie banner (in bodyStart) also has .govuk-body/h2.
    expect(
      document.querySelector('#main-content .govuk-body').textContent
    ).toContain(
      'This service puts small files (known as cookies) onto your computer.'
    )
    expect(document.querySelector('#main-content h2').textContent).toContain(
      'Essential cookies'
    )

    const tableRows = document.querySelectorAll(
      '[data-cookie-table="essential"] .govuk-table__body .govuk-table__row'
    )
    expect(tableRows).toHaveLength(3)

    const cookieNames = ['userSession', 'session', 'bell-defraId']
    cookieNames.forEach((cookieName) => {
      expect(payload).toEqual(expect.stringContaining(cookieName))
    })
    expect(payload).not.toEqual(
      expect.stringContaining('Remembers your language choice')
    )
  })

  test('Should include the lang cookie when welsh language is enabled', async () => {
    config.set('featureFlags.welshLanguage', true)
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window
    const tableRows = document.querySelectorAll(
      '[data-cookie-table="essential"] .govuk-table__body .govuk-table__row'
    )

    expect(tableRows).toHaveLength(4)
    expect(payload).toEqual(
      expect.stringContaining('Remembers your language choice')
    )
  })

  test('Should render the analytics accept/reject form when GA is enabled', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window
    const form = document.querySelector('[data-module="app-cookie-settings"]')

    expect(form).not.toBeNull()
    expect(form.getAttribute('data-gtm-id')).toBeTruthy()

    const radios = form.querySelectorAll('input[name="cookies[analytics]"]')
    expect(Array.from(radios).map((radio) => radio.value)).toEqual([
      'accepted',
      'rejected'
    ])

    // Hidden until cookie-settings.js reveals it, so users without JavaScript never see it.
    expect(form.hidden).toBe(true)

    // The confirmation sits at the top of the main content, above the h1.
    const confirmation = document.querySelector(
      '[data-cookie-settings-confirmation]'
    )
    expect(confirmation.hidden).toBe(true)
    expect(
      confirmation.compareDocumentPosition(document.querySelector('h1')) &
        document.defaultView.Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(payload).toEqual(expect.stringContaining('Save cookie settings'))
  })

  test('Should list the analytics and consent cookies when GA is enabled', async () => {
    config.set('featureFlags.googleAnalytics', true)
    config.set('featureFlags.welshLanguage', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window
    const firstCells = (table) =>
      Array.from(
        document.querySelectorAll(
          `[data-cookie-table="${table}"] .govuk-table__body .govuk-table__row`
        )
      ).map((row) => row.querySelector('.govuk-table__cell').textContent.trim())

    expect(firstCells('analytics')).toEqual(['_ga', '_ga_<container-id>'])
    expect(firstCells('essential')).toEqual([
      'userSession',
      'session',
      'bell-defraId',
      'cookie_preferences_set'
    ])

    // Shown even without JavaScript, unlike the form.
    const analyticsTable = document.querySelector(
      '[data-cookie-table="analytics"]'
    )
    expect(analyticsTable.closest('[hidden]')).toBeNull()
  })

  test('Should not list the analytics or consent cookies when GA is disabled', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(payload).not.toEqual(expect.stringContaining('_ga'))
    expect(payload).not.toEqual(
      expect.stringContaining('cookie_preferences_set')
    )
  })

  test('Should render the analytics form on the Welsh page when GA is enabled', async () => {
    config.set('featureFlags.googleAnalytics', true)
    config.set('featureFlags.welshLanguage', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Cwcis |'))

    const form = document.querySelector('[data-module="app-cookie-settings"]')
    expect(form).not.toBeNull()
    expect(form.getAttribute('data-gtm-id')).toBeTruthy()

    const radios = form.querySelectorAll('input[name="cookies[analytics]"]')
    expect(Array.from(radios).map((radio) => radio.value)).toEqual([
      'accepted',
      'rejected'
    ])
  })

  test('Should not render the analytics form when GA is disabled', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(payload).not.toEqual(expect.stringContaining('app-cookie-settings'))
  })

  test('Should render the Welsh cookies page when lang=cy', async () => {
    config.set('featureFlags.welshLanguage', true)
    // Essential-cookies content only; the analytics banner/form have their own tests.
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Cwcis |'))
    expect(document.querySelector('h1').textContent).toContain('Cwcis')
    // Scope to main content: the cookie banner (in bodyStart) also has an h2.
    expect(document.querySelector('#main-content h2').textContent).toContain(
      'Cwcis hanfodol'
    )
  })
})
