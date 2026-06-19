import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'

import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { config } from '../../../config/config.js'

describe('#cannotMakePaymentController', () => {
  let server
  let credentials
  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
    credentials = await setupAuthedUserSession(server)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const pageContent = content.cannotMakePayment()
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cannotMakePayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    const pageDescription = document.querySelectorAll(
      '[data-testid="app-heading-caption"]'
    )[0].textContent

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )
    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )
    expect(pageDescription).toEqual(
      expect.stringContaining(pageContent.heading.caption)
    )

    const link = document.querySelector(
      '[data-testid="app-heading"] .govuk-body .govuk-link'
    )
    expect(link.getAttribute('href')).toBe(pageContent.link.href)
    expect(link.textContent).toBe(pageContent.link.text)
  })
})
