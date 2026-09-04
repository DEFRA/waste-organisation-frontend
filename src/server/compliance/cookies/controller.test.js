import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'

describe('#cookiesController', () => {
  let server
  let initialWelshLanguageFlag

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    server = await initialiseServer()
  })

  afterEach(() => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
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
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Cookies |'))
    expect(document.querySelector('h1').textContent).toContain('Cookies')
    expect(document.querySelector('.govuk-body').textContent).toContain(
      'This service puts small files (known as cookies) onto your computer.'
    )
    expect(document.querySelector('h2').textContent).toContain(
      'Essential cookies'
    )

    const tableRows = document.querySelectorAll(
      '.govuk-table__body .govuk-table__row'
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

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window
    const tableRows = document.querySelectorAll(
      '.govuk-table__body .govuk-table__row'
    )

    expect(tableRows).toHaveLength(4)
    expect(payload).toEqual(
      expect.stringContaining('Remembers your language choice')
    )
  })

  test('Should render the Welsh cookies page when lang=cy', async () => {
    config.set('featureFlags.welshLanguage', true)
    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.cookies}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Cwcis |'))
    expect(document.querySelector('h1').textContent).toContain('Cwcis')
    expect(document.querySelector('h2').textContent).toContain('Cwcis hanfodol')
  })
})
