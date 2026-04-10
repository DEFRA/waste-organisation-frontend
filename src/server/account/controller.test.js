import { JSDOM } from 'jsdom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const organisationName = 'Test Organisation'

describe('#accountController', () => {
  let server
  let credentials

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('when feature flag is enabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.serviceCharge', true)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationName = organisationName
      credentials.currentOrganisationId = 'org-1'
    })

    afterEach(() => {
      config.set('featureFlags.serviceCharge', false)
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
    })

    test('displays the organisation name', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.account,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const orgName = document.querySelector(
        '[data-testid="app-heading-organisation-name"]'
      ).textContent

      expect(orgName).toEqual(expect.stringContaining(organisationName))
    })

    test('displays the switch organisation button', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.account,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const switchButton = document.querySelector(
        '[data-testid="switch-organisation-button"]'
      )

      expect(switchButton).not.toBeNull()
      expect(switchButton.getAttribute('href')).toBe(
        paths.signinDefraIdCallback
      )
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

    test('shows payment due state when service charge is enabled and unpaid', async () => {
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

      const paymentDueTag = document.querySelector(
        '[data-testid="service-charge-payment-due"]'
      )

      const importantNotice = document.querySelector(
        '[data-testid="service-charge-important-notice"]'
      )

      const importantNoticeApiLink = document.querySelector(
        '[data-testid="important-notice-api-link"]'
      )

      const nextPaymentDue = document.querySelector(
        '[data-testid="service-charge-next-payment-due"]'
      )

      const pageContent = content.account({}, organisationName)

      expect(serviceChargeLink).not.toBeNull()
      expect(serviceChargeLink.getAttribute('href')).toBe(paths.serviceCharge)
      expect(serviceChargeLink.textContent).toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.text)
      )

      expect(payload).toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.paymentDueTag)
      )
      expect(payload).not.toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.paidTag)
      )
      expect(paymentDueTag).not.toBeNull()
      expect(nextPaymentDue).toBeNull()

      expect(importantNotice).not.toBeNull()
      expect(importantNoticeApiLink).not.toBeNull()
      expect(importantNoticeApiLink.getAttribute('href')).toBe(paths.apiList)
      expect(importantNoticeApiLink.textContent).toEqual(
        expect.stringContaining('manage your API code')
      )
      expect(payload).toEqual(
        expect.stringContaining(
          `You need to pay your annual service charge for ${organisationName} before you can report your waste movements.`
        )
      )
    })

    test('shows paid service charge state when payment success flash is present', async () => {
      const stateServer = await initialiseServer()
      stateServer.injectYarState({ type: 'paymentStatus', message: 'success' })

      const stateCredentials = await setupAuthedUserSession(stateServer)
      stateCredentials.currentOrganisationName = organisationName
      stateCredentials.currentOrganisationId = 'org-1'

      const { payload } = await stateServer.inject({
        method: 'GET',
        url: paths.account,
        auth: {
          strategy: 'session',
          credentials: stateCredentials
        }
      })

      const pageContent = content.account({}, organisationName)
      const { document } = new JSDOM(payload).window

      const paymentDueTag = document.querySelector(
        '[data-testid="service-charge-payment-due"]'
      )

      const importantNotice = document.querySelector(
        '[data-testid="service-charge-important-notice"]'
      )

      expect(payload).toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.paidTag)
      )
      expect(payload).toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.nextPaymentDue)
      )
      expect(payload).not.toEqual(
        expect.stringContaining(pageContent.cards.serviceCharge.paymentDueTag)
      )
      expect(paymentDueTag).toBeNull()
      expect(importantNotice).toBeNull()

      await stateServer.stop({ timeout: 0 })
    })
  })

  describe('when service charge feature flag is disabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.serviceCharge', false)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationName = organisationName
      credentials.currentOrganisationId = 'org-1'
    })

    afterEach(() => {
      config.set('featureFlags.serviceCharge', false)
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

  describe('when not authenticated', () => {
    beforeEach(async () => {
      config.set('featureFlags.serviceCharge', true)
      server = await initialiseServer()
    })

    afterEach(() => {
      config.set('featureFlags.serviceCharge', false)
    })

    test('returns unauthorized', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.account
      })

      expect(statusCode).toBe(statusCodes.unauthorized)
    })
  })
})
