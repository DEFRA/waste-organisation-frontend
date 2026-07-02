import { JSDOM } from 'jsdom'

import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import {
  initialiseServer,
  wreckGetMock
} from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const organisationName = 'Test Organisation'

describe('#accountController', () => {
  let server
  let credentials
  let initialServiceChargeFeatureFlag

  beforeEach(() => {
    wreckGetMock.mockReturnValue({
      payload: {
        organisation: {
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
      }
    })
  })

  beforeAll(async () => {
    initialServiceChargeFeatureFlag = config.get('featureFlags.serviceCharge')
    config.set('featureFlags.serviceCharge', false)
    server = await initialiseServer()
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
    credentials.currentOrganisationId = 'org-1'
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', initialServiceChargeFeatureFlag)
    wreckGetMock.mockReset()
    await server.stop({ timeout: 0 })
  })

  test('displays the service charge card as text with due date', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const serviceChargeLink = document.querySelector(
      '[data-testid="service-charge-link"]'
    )

    const serviceChargeText = document.querySelector(
      '[data-testid="service-charge-text"]'
    )

    const serviceChargeDueDate = document.querySelector(
      '[data-testid="service-charge-due-date"]'
    )

    const paymentDueTag = document.querySelector(
      '[data-testid="service-charge-payment-due"]'
    )

    const importantNotice = document.querySelector(
      '[data-testid="service-charge-important-notice"]'
    )

    const nextPaymentDue = document.querySelector(
      '[data-testid="service-charge-next-payment-due"]'
    )

    expect(serviceChargeLink).toBeNull()
    expect(serviceChargeText).not.toBeNull()
    expect(serviceChargeText.textContent).toEqual(
      expect.stringContaining('Service charge')
    )
    expect(serviceChargeDueDate).not.toBeNull()
    expect(serviceChargeDueDate.textContent).toEqual(
      expect.stringContaining('Due October 2026')
    )
    expect(paymentDueTag).toBeNull()
    expect(nextPaymentDue).toBeNull()
    expect(importantNotice).toBeNull()
  })
})
