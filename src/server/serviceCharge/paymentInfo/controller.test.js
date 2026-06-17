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

describe('#serviceChargeController', () => {
  let server
  let credentials

  beforeAll(async () => {
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
  })

  test('returns 200 with expected page content', async () => {
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

    const pageContent = content.serviceCharge({}, 4000)

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

    const heading = document.querySelector('[data-testid="app-heading-title"]')
    const cost = document.querySelector('[data-testid="service-charge-cost"]')
    const requirementsIntro = document.querySelector(
      '[data-testid="service-charge-requirements-intro"]'
    )
    const warning = document.querySelector(
      '[data-testid="service-charge-warning"]'
    )
    const button = document.querySelector(
      '[data-testid="pay-service-charge-button"]'
    )
    const cancelLink = document.querySelector(
      '[data-testid="service-charge-cancel-link"]'
    )

    expect(heading).not.toBeNull()
    expect(heading.textContent).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )

    expect(cost).not.toBeNull()
    expect(cost.textContent).toEqual(expect.stringContaining(pageContent.cost))

    expect(requirementsIntro).not.toBeNull()
    expect(requirementsIntro.textContent).toEqual(
      expect.stringContaining(pageContent.requirementsIntro)
    )

    expect(payload).toEqual(
      expect.stringContaining(pageContent.requirements[0])
    )
    expect(payload).toEqual(
      expect.stringContaining(pageContent.requirements[1])
    )

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

  test.each([{}, { paymentPeriods: [] }, { paymentPeriods: null }])(
    'redirect to cannotMakePayment when no payments are avalible',
    async (paymentPeriods) => {
      const expectedOrganisation = {
        organisationId: 'orgid',
        disableAfter: '2026-10-01T00:00:00.000Z',
        users: ['6310cc75-8c51-46cd-9fb2-93656667ca69'],
        ...paymentPeriods
      }

      wreckGetMock.mockReturnValue({
        payload: { organisation: expectedOrganisation }
      })

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: paths.serviceCharge,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(paths.cannotMakePayment)
    }
  )

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.serviceCharge
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
