import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

describe('#cookiesController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
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
    expect(tableRows).toHaveLength(4)

    const cookieNames = ['userSession', 'session', 'bell-defraId', 'lang']
    cookieNames.forEach((cookieName) => {
      expect(payload).toEqual(expect.stringContaining(cookieName))
    })
  })

  test('Should render the Welsh cookies page when lang=cy', async () => {
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
