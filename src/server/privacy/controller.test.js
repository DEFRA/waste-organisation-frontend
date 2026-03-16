import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#privacyNoticeController', () => {
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
      url: paths.privacyNotice
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Privacy notice |'))
  })

  test('Should have a link to privacy notice in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    expect(result).toEqual(expect.stringContaining('href="/privacy-notice"'))
  })

  test('Should render content from translations', async () => {
    const pageContent = content.privacyNotice({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const heading = document.querySelector('h1').textContent
    expect(heading).toEqual(expect.stringContaining(pageContent.heading))

    const introParagraph = document.querySelector(
      '.govuk-grid-column-two-thirds > .govuk-body'
    ).innerHTML
    expect(introParagraph).toEqual(
      expect.stringContaining('WasteTracking_Testing@defra.gov.uk')
    )

    const sectionHeadings = document.querySelectorAll(
      '.govuk-grid-column-two-thirds h2'
    )
    expect(sectionHeadings).toHaveLength(pageContent.sections.length)
    pageContent.sections.forEach((section, index) => {
      expect(sectionHeadings[index].textContent).toEqual(
        expect.stringContaining(section.heading)
      )
    })
  })
})
