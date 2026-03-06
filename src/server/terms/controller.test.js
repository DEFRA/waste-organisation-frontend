import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#termsController', () => {
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
      url: paths.terms
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Terms |'))
  })

  test('Should have a link to terms in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(result).toEqual(expect.stringContaining('href="/terms"'))
  })

  test('Should render content from translations', async () => {
    const pageContent = content.terms({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const heading = document.querySelector('h1').textContent
    expect(heading).toEqual(expect.stringContaining(pageContent.heading))

    const leadParagraph = document.querySelector('.govuk-body-l').textContent
    expect(leadParagraph).toEqual(
      expect.stringContaining(pageContent.leadParagraph)
    )

    const listItems = document.querySelectorAll('.govuk-list--bullet li')
    expect(listItems).toHaveLength(pageContent.conditions.length)
    pageContent.conditions.forEach((condition, index) => {
      expect(listItems[index].textContent).toEqual(
        expect.stringContaining(condition)
      )
    })
  })
})
