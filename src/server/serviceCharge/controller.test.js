import { JSDOM } from 'jsdom'

import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#serviceChargeController', () => {
  let server
  let credentials

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
  })

  test('returns 200 with expected page content', async () => {
    const pageContent = content.serviceCharge({})

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.serviceCharge,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.ok)
    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const heading = document.querySelector('[data-testid="service-charge-heading"]')
    const cost = document.querySelector('[data-testid="service-charge-cost"]')
    const requirementsIntro = document.querySelector(
      '[data-testid="service-charge-requirements-intro"]'
    )
    const warning = document.querySelector('[data-testid="service-charge-warning"]')
    const button = document.querySelector('[data-testid="pay-service-charge-button"]')
    const cancelLink = document.querySelector(
      '[data-testid="service-charge-cancel-link"]'
    )

    expect(heading).not.toBeNull()
    expect(heading.textContent).toEqual(
      expect.stringContaining(pageContent.heading)
    )

    expect(cost).not.toBeNull()
    expect(cost.textContent).toEqual(expect.stringContaining(pageContent.cost))

    expect(requirementsIntro).not.toBeNull()
    expect(requirementsIntro.textContent).toEqual(
      expect.stringContaining(pageContent.requirementsIntro)
    )

    expect(payload).toEqual(expect.stringContaining(pageContent.requirements[0]))
    expect(payload).toEqual(expect.stringContaining(pageContent.requirements[1]))

    expect(warning).not.toBeNull()
    expect(warning.textContent).toEqual(
      expect.stringContaining(pageContent.warning)
    )

    expect(button).not.toBeNull()
    expect(button.textContent).toEqual(
      expect.stringContaining(pageContent.payServiceCharge)
    )
    expect(button.getAttribute('href')).toBe(paths.reviewPayment)

    expect(cancelLink).not.toBeNull()
    expect(cancelLink.getAttribute('href')).toBe(paths.account)
    expect(cancelLink.textContent).toEqual(
      expect.stringContaining(pageContent.cancel)
    )
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.serviceCharge
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
