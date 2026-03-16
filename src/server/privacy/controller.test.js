import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

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

  test('Should render the privacy notice content', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    const { document } = new JSDOM(payload).window

    const heading = document.querySelector('h1')
    expect(heading.textContent).toContain(
      'Waste tracking receipt of waste beta phase privacy notice'
    )

    const sectionHeadings = document.querySelectorAll(
      '.govuk-grid-column-two-thirds h2'
    )
    expect(sectionHeadings).toHaveLength(13)
    expect(sectionHeadings[0].textContent).toContain(
      'Who collects your personal data'
    )

    const contactLink = document.querySelector(
      'a[href="mailto:WasteTracking_Testing@defra.gov.uk"]'
    )
    expect(contactLink).not.toBeNull()
  })
})
