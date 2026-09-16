import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'

describe('#accessibilityStatementController', () => {
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

    expect(
      document.querySelector(
        'a[href="https://www.equalityadvisoryservice.com/"]'
      )
    ).not.toBeNull()
    expect(
      document.querySelector('a[href="https://www.gov.uk/call-charges"]')
    ).not.toBeNull()
  })

  test('Should open enforcement and call charges links in Welsh when lang=cy', async () => {
    config.set('featureFlags.welshLanguage', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.accessibility}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(
      document.querySelector('a[href="https://eass-ws.custhelp.com/"]')
    ).not.toBeNull()
    expect(
      document.querySelector('a[href="https://www.gov.uk/costau-galwadau"]')
    ).not.toBeNull()
    expect(
      document.querySelector(
        'a[href="https://www.equalityadvisoryservice.com/"]'
      )
    ).toBeNull()
    expect(
      document.querySelector('a[href="https://www.gov.uk/call-charges"]')
    ).toBeNull()
  })
})
