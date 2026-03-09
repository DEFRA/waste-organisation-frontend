import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#cookiesController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 with the correct page title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Cookies |'))
  })

  test('Should have a link to cookies in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(result).toEqual(expect.stringContaining('href="/cookies"'))
  })

  test('Should render content from translations', async () => {
    const pageContent = content.cookies({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const heading = document.querySelector('h1').textContent
    expect(heading).toEqual(expect.stringContaining(pageContent.heading))

    const introParagraph = document.querySelector('.govuk-body').textContent
    expect(introParagraph).toEqual(
      expect.stringContaining(pageContent.introParagraph)
    )

    const tableRows = document.querySelectorAll(
      '.govuk-table__body .govuk-table__row'
    )
    expect(tableRows).toHaveLength(3)

    const cookieNames = ['userSession', 'session', 'bell-defraId']
    cookieNames.forEach((cookieName) => {
      expect(payload).toEqual(expect.stringContaining(cookieName))
    })
  })
})
