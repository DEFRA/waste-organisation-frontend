import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

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
      url: paths.accessibility
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Accessibility statement for Report receipt of waste |'
      )
    )
  })

  test('Should render the privacy notice content', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.accessibility
    })

    const { document } = new JSDOM(payload).window

    const heading = document.querySelector('h1')
    expect(heading.textContent).toContain(
      'Accessibility statement for Report receipt of waste'
    )

    const sectionHeadings = document.querySelectorAll(
      '.govuk-grid-column-two-thirds h2'
    )
    expect(sectionHeadings).toHaveLength(9)
    expect(sectionHeadings[0].textContent).toContain(
      'How accessible this website is'
    )
  })
})
