import { JSDOM } from 'jsdom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  initialiseServer,
  wreckGetMock
} from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { faker } from '@faker-js/faker'

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
    config.set('featureFlags.serviceCharge', true)
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

  test('returns 200 with correct page title and heading', async () => {
    const pageContent = content.account({}, organisationName)

    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: paths.account,
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

    const pageHeading = document.querySelector(
      '[data-testid="app-heading-title"]'
    ).textContent

    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )

    const orgName = document.querySelector(
      '[data-testid="app-heading-organisation-name"]'
    ).textContent

    expect(orgName).toEqual(expect.stringContaining(organisationName))

    const switchButton = document.querySelector(
      '[data-testid="switch-organisation-button"]'
    )

    expect(switchButton).not.toBeNull()
    expect(switchButton.getAttribute('href')).toBe(paths.signinDefraIdCallback)
  })

  test('displays the report waste card with correct link', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const reportWasteLink = document.querySelector(
      '[data-testid="report-waste-link"]'
    )

    expect(reportWasteLink).not.toBeNull()
    expect(reportWasteLink.getAttribute('href')).toBe(paths.nextAction)
    expect(reportWasteLink.textContent).toEqual(
      expect.stringContaining('Report receipt of waste')
    )
  })

  test('displays the manage account card with correct link', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const manageAccountLink = document.querySelector(
      '[data-testid="manage-account-link"]'
    )

    expect(manageAccountLink).not.toBeNull()
    expect(manageAccountLink.getAttribute('href')).toBe(
      config.get('auth.defraId.accountManagementUrl')
    )
    expect(manageAccountLink.textContent).toEqual(
      expect.stringContaining('Manage account')
    )
  })

  test('page does not show important notice when service is paid', async () => {
    wreckGetMock.mockReturnValue({
      payload: {
        organisation: {
          organisationId: 'orgid',
          disableAfter: faker.date.future(),
          users: ['6310cc75-8c51-46cd-9fb2-93656667ca69'],
          paymentPeriods: []
        }
      }
    })

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const infoBanner = document.querySelector(
      '[data-testid="app-important-banner"]'
    )
    expect(infoBanner).toBeNull()
  })

  test('page shows important notice when service it not paid', async () => {
    wreckGetMock.mockReturnValue({
      payload: {
        organisation: {
          organisationId: 'orgid',
          disableAfter: faker.date.past(),
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

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const sharedServiceChargeContent = content.sharedServiceChargeInfo(
      {},
      credentials.currentOrganisationName
    )

    const infoBanner = document.querySelector(
      '[data-testid="app-important-banner"]'
    )
    expect(infoBanner).not.toBeNull()
    expect(
      infoBanner.querySelector('.govuk-notification-banner__heading')
        .textContent
    ).toBe(sharedServiceChargeContent.notPaidNotice.heading)

    expect(infoBanner.querySelector('.govuk-body').textContent).toEqual(
      expect.stringContaining(sharedServiceChargeContent.notPaidNotice.body)
    )
  })

  test('shows payment due state when service charge is enabled and unpaid', async () => {
    const expectedOrganisation = {
      disableAfter: faker.date.past(),
      paymentPeriods: []
    }

    wreckGetMock.mockReturnValue({
      payload: { organisation: expectedOrganisation }
    })

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

    const paymentDue = document.querySelector(
      '[data-testid="service-charge-next-payment-due"]'
    )

    const pageContent = content.account({}, organisationName)

    expect(serviceChargeLink).not.toBeNull()
    expect(serviceChargeLink.getAttribute('href')).toBe(paths.serviceCharge)
    expect(serviceChargeLink.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.text)
    )

    const paymentDueTag = paymentDue.querySelector('.govuk-tag.govuk-tag--red')

    expect(paymentDueTag).not.toBeNull()
    expect(paymentDueTag.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.paymentDueTag)
    )
  })

  test('shows paid state when service charge paid', async () => {
    const expectedOrganisation = {
      disableAfter: '2026-10-01T00:00:00.000Z',
      paymentPeriods: []
    }

    wreckGetMock.mockReturnValue({
      payload: { organisation: expectedOrganisation }
    })

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

    const paymentDue = document.querySelector(
      '[data-testid="service-charge-next-payment-due"]'
    )

    const pageContent = content.account({}, organisationName)

    expect(serviceChargeLink).toBeNull()

    const paymentDueTag = paymentDue.querySelector(
      '.govuk-tag.govuk-tag--green'
    )

    expect(paymentDueTag).not.toBeNull()
    expect(paymentDueTag.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.paidTag)
    )

    const nextPaymentDueContent =
      paymentDue.querySelector('.govuk-body').textContent

    expect(nextPaymentDueContent).toEqual(
      expect.stringContaining(
        `${pageContent.cards.serviceCharge.nextPaymentDue} October 2026.`
      )
    )
  })

  test('shows paid state when service charge paid and pay now link if you can pay for next period', async () => {
    const expectedOrganisation = {
      disableAfter: '2026-10-01T00:00:00.000Z',
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

    const paymentDue = document.querySelector(
      '[data-testid="service-charge-next-payment-due"]'
    )

    const pageContent = content.account({}, organisationName)

    expect(serviceChargeLink).not.toBeNull()
    expect(serviceChargeLink.getAttribute('href')).toBe(paths.serviceCharge)
    expect(serviceChargeLink.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.text)
    )

    const paymentDueTag = paymentDue.querySelector(
      '.govuk-tag.govuk-tag--green'
    )

    expect(paymentDueTag).not.toBeNull()
    expect(paymentDueTag.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.paidTag)
    )

    const nextPaymentDueContent =
      paymentDue.querySelector('.govuk-body').textContent

    expect(nextPaymentDueContent).toEqual(
      expect.stringContaining(
        `${pageContent.cards.serviceCharge.nextPaymentDue} October 2026.`
      )
    )

    const payNowLink = paymentDue.querySelector(
      '[data-testid="service-charge-pay-now-link"]'
    )

    expect(payNowLink).not.toBeNull()
    expect(payNowLink.getAttribute('href')).toBe(paths.serviceCharge)
    expect(payNowLink.textContent).toEqual(
      expect.stringContaining(pageContent.cards.serviceCharge.payNow)
    )
  })

  test('returns unauthorized', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.account
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
