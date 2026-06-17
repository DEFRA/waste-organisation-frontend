import { JSDOM } from 'jsdom'

import { config } from '../../../config/config.js'
import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckGetMock
} from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'

const MESSAGE_TYPE = 'payment-periods'

describe('#reviewPaymentController', () => {
  let server
  let credentials

  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = 'Test Waste Organisation'
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  test('returns 200 with expected static page content', async () => {
    const expectedOrganisation = {
      organisationId: 'orgid',
      disableAfter: '2026-10-01T00:00:00.000Z',
      users: ['6310cc75-8c51-46cd-9fb2-93656667ca69'],
      paymentPeriods: [
        {
          from: '2026-10-01T00:00:00.000Z',
          to: '2027-10-01T00:00:00.000Z',
          priceInPence: 4000
        }
      ]
    }

    wreckGetMock.mockReturnValue({
      payload: { organisation: expectedOrganisation }
    })

    const pageContent = content.reviewPayment(
      {},
      credentials.currentOrganisationName
    )

    const { statusCode, payload, request } = await server.inject({
      method: 'GET',
      url: paths.reviewPayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(request.yar.flash(MESSAGE_TYPE)).toEqual([
      {
        from: '2026-10-01T00:00:00.000Z',
        to: '2027-10-01T00:00:00.000Z',
        priceInPence: 4000
      }
    ])

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.ok)
    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const heading = document.querySelector('[data-testid="app-heading-title"]')
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
      expect.stringContaining(pageContent.heading.text)
    )

    expect(intro).not.toBeNull()
    expect(intro.textContent).toEqual(
      expect.stringContaining(pageContent.intro)
    )

    expect(intro.textContent).toEqual(
      expect.stringContaining('12:00am on Friday 1 October 2027')
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
    expect(payload).toEqual(
      expect.stringContaining(pageContent.organisation.name)
    )
    expect(payload).toEqual(
      expect.stringContaining(pageContent.organisation.totalCostLabel)
    )
    expect(payload).toEqual(expect.stringContaining('£40.00'))

    expect(continueButton).not.toBeNull()
    expect(continueButton.textContent).toEqual(
      expect.stringContaining(pageContent.continue)
    )
    expect(continueButton.getAttribute('href')).toBe(paths.initiatePayment)

    expect(cancelLink).not.toBeNull()
    expect(cancelLink.getAttribute('href')).toBe(paths.account)
    expect(cancelLink.textContent).toEqual(
      expect.stringContaining(pageContent.cancel)
    )
  })

  test('redirect to cannotMakePayment when no payments are avalible', async (paymentPeriods) => {
    const expectedOrganisation = {
      organisationId: 'orgid',
      disableAfter: '2026-10-01T00:00:00.000Z',
      users: ['6310cc75-8c51-46cd-9fb2-93656667ca69'],
      paymentPeriods: []
    }

    wreckGetMock.mockReturnValue({
      payload: { organisation: expectedOrganisation }
    })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.reviewPayment,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.cannotMakePayment)
  })

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.reviewPayment
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
