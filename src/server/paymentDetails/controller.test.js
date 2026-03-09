import { JSDOM } from 'jsdom'

import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#paymentDetailsController', () => {
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

  test('returns 200 with expected static payment details content', async () => {
    const pageContent = content.paymentDetails({})

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
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

    const heading = document.querySelector('[data-testid="payment-details-heading"]')
    const summaryTitle = document.querySelector(
      '[data-testid="payment-summary-title"]'
    )
    const summaryCharge = document.querySelector(
      '[data-testid="payment-summary-charge"]'
    )
    const summaryTotal = document.querySelector(
      '[data-testid="payment-summary-total"]'
    )
    const cardNumberInput = document.querySelector(
      '[data-testid="card-number-input"]'
    )
    const continueButton = document.querySelector(
      '[data-testid="payment-details-continue-button"]'
    )
    const cancelLink = document.querySelector(
      '[data-testid="payment-details-cancel-link"]'
    )
    const backLink = document.querySelector('[data-testid="back-link"]')

    expect(heading).not.toBeNull()
    expect(heading.textContent).toEqual(
      expect.stringContaining(pageContent.heading)
    )

    expect(summaryTitle).not.toBeNull()
    expect(summaryTitle.textContent).toEqual(
      expect.stringContaining(pageContent.summary.heading)
    )
    expect(summaryCharge).not.toBeNull()
    expect(summaryCharge.textContent).toEqual(
      expect.stringContaining(pageContent.summary.charge)
    )
    expect(summaryTotal).not.toBeNull()
    expect(summaryTotal.textContent).toEqual(
      expect.stringContaining(pageContent.summary.totalAmount)
    )

    expect(payload).toEqual(expect.stringContaining(pageContent.card.numberLabel))
    expect(payload).toEqual(
      expect.stringContaining(pageContent.card.acceptedCards)
    )
    expect(payload).toEqual(expect.stringContaining(pageContent.card.expiryLabel))
    expect(payload).toEqual(
      expect.stringContaining(pageContent.card.securityCodeLabel)
    )
    expect(payload).toEqual(
      expect.stringContaining(pageContent.billingAddress.heading)
    )
    expect(payload).toEqual(
      expect.stringContaining(pageContent.contactDetails.heading)
    )

    expect(cardNumberInput).not.toBeNull()

    expect(continueButton).not.toBeNull()
    expect(continueButton.textContent).toEqual(
      expect.stringContaining(pageContent.continue)
    )

    expect(cancelLink).not.toBeNull()
    expect(cancelLink.getAttribute('href')).toBe(paths.account)
    expect(cancelLink.textContent).toEqual(
      expect.stringContaining(pageContent.cancel)
    )

    expect(backLink).not.toBeNull()
    expect(backLink.getAttribute('href')).toBe(paths.reviewPayment)
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
