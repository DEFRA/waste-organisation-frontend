import { JSDOM } from 'jsdom'

import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#reviewPaymentController', () => {
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

  test('returns 200 with expected static page content', async () => {
    const pageContent = content.reviewPayment({})

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.reviewPayment,
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

    const heading = document.querySelector('[data-testid="review-payment-heading"]')
    const intro = document.querySelector('[data-testid="review-payment-intro"]')
    const sectionHeading = document.querySelector(
      '[data-testid="review-payment-section-heading"]'
    )
    const organisationHeading = document.querySelector(
      '[data-testid="review-payment-organisation-heading"]'
    )
    const continueButton = document.querySelector(
      '[data-testid="review-payment-continue-button"]'
    )
    const cancelLink = document.querySelector(
      '[data-testid="review-payment-cancel-link"]'
    )

    expect(heading).not.toBeNull()
    expect(heading.textContent).toEqual(
      expect.stringContaining(pageContent.heading)
    )

    expect(intro).not.toBeNull()
    expect(intro.textContent).toEqual(expect.stringContaining(pageContent.intro))
    expect(intro.textContent).toEqual(
      expect.stringContaining(pageContent.accessUntil)
    )

    expect(sectionHeading).not.toBeNull()
    expect(sectionHeading.textContent).toEqual(
      expect.stringContaining(pageContent.sectionHeading)
    )

    expect(organisationHeading).not.toBeNull()
    expect(organisationHeading.textContent).toEqual(
      expect.stringContaining(pageContent.organisation.heading)
    )

    expect(payload).toEqual(
      expect.stringContaining(pageContent.organisation.nameLabel)
    )
    expect(payload).toEqual(expect.stringContaining(pageContent.organisation.name))
    expect(payload).toEqual(
      expect.stringContaining(pageContent.organisation.totalCostLabel)
    )
    expect(payload).toEqual(
      expect.stringContaining(pageContent.organisation.totalCost)
    )

    expect(continueButton).not.toBeNull()
    expect(continueButton.textContent).toEqual(
      expect.stringContaining(pageContent.continue)
    )

    expect(cancelLink).not.toBeNull()
    expect(cancelLink.getAttribute('href')).toBe(paths.serviceCharge)
    expect(cancelLink.textContent).toEqual(
      expect.stringContaining(pageContent.cancel)
    )
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.reviewPayment
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
