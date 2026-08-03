import { JSDOM } from 'jsdom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths, pathTo } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const organisationName = 'Test Organisation'
const organisationId = 'org-1'

describe('#newAccountController', () => {
  let server
  let credentials

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('when feature flag is enabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.newAccountPage', true)
      config.set('featureFlags.serviceCharge', true)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationName = organisationName
      credentials.currentOrganisationId = organisationId
    })

    afterEach(() => {
      config.set('featureFlags.newAccountPage', false)
      config.set('featureFlags.serviceCharge', false)
    })

    test('returns 200 with correct page title and heading', async () => {
      const pageContent = content.newAccount({}, organisationName)

      const { payload, statusCode } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
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
        url: paths.newAccount,
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

    test('displays the switch or add an organisation section', async () => {
      const pageContent = content.newAccount({}, organisationName)

      const { payload } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      expect(payload).toEqual(
        expect.stringContaining(pageContent.switchOrganisation.heading)
      )
      expect(payload).toEqual(
        expect.stringContaining(pageContent.switchOrganisation.description)
      )

      const switchLink = document.querySelector(
        '[data-testid="switch-organisation-link"]'
      )
      expect(switchLink).not.toBeNull()
      expect(switchLink.getAttribute('href')).toBe(paths.signinDefraIdCallback)
      expect(switchLink.textContent).toEqual(
        expect.stringContaining(pageContent.switchOrganisation.switchLinkText)
      )

      const addLink = document.querySelector(
        '[data-testid="add-organisation-link"]'
      )
      expect(addLink).not.toBeNull()
      expect(addLink.getAttribute('href')).toBe(paths.signinDefraIdCallback)
      expect(addLink.textContent).toEqual(
        expect.stringContaining(pageContent.switchOrganisation.addLinkText)
      )
    })

    test('displays the report waste heading', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const reportWasteHeading = document.querySelector(
        '[data-testid="report-waste-heading"]'
      )

      expect(reportWasteHeading).not.toBeNull()
      expect(reportWasteHeading.textContent).toEqual(
        expect.stringContaining('Report receipt of waste')
      )
    })

    test('displays report waste links', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const apiLink = document.querySelector(
        '[data-testid="report-waste-connectYourSoftware-link"]'
      )
      expect(apiLink).not.toBeNull()
      expect(apiLink.getAttribute('href')).toBe(paths.apiList)
      expect(apiLink.textContent).toEqual(
        expect.stringContaining('Manage my API code')
      )

      const downloadLink = document.querySelector(
        '[data-testid="report-waste-downloadSpreadsheet-link"]'
      )
      expect(downloadLink).not.toBeNull()
      expect(downloadLink.getAttribute('href')).toBe(paths.downloadSpreadsheet)

      const uploadLink = document.querySelector(
        '[data-testid="report-waste-uploadSpreadsheet-link"]'
      )
      expect(uploadLink).not.toBeNull()
      expect(uploadLink.getAttribute('href')).toBe(
        pathTo(paths.spreadsheetUpload, { organisationId })
      )

      const updateLink = document.querySelector(
        '[data-testid="report-waste-updateSpreadsheet-link"]'
      )
      expect(updateLink).not.toBeNull()
      expect(updateLink.getAttribute('href')).toBe(
        pathTo(paths.updateSpreadsheetUpload, { organisationId })
      )
    })

    test('returns 403 when organisationId is missing', async () => {
      credentials.currentOrganisationId = undefined

      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.forbidden)

      credentials.currentOrganisationId = organisationId
    })

    test('shows payment due state when service charge is enabled and unpaid', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
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

      const pageContent = content.newAccount({}, organisationName)

      expect(serviceChargeLink).not.toBeNull()
      expect(serviceChargeLink.getAttribute('href')).toBe(paths.serviceCharge)
      expect(serviceChargeLink.textContent).toEqual(
        expect.stringContaining(
          pageContent.cards.serviceCharge.payServiceCharge
        )
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
      stateServer.injectYarState({
        type: 'paymentStatus',
        message: 'success'
      })

      config.set('featureFlags.newAccountPage', true)
      config.set('featureFlags.serviceCharge', true)

      const stateCredentials = await setupAuthedUserSession(stateServer)
      stateCredentials.currentOrganisationName = organisationName
      stateCredentials.currentOrganisationId = organisationId

      const { payload } = await stateServer.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials: stateCredentials
        }
      })

      const pageContent = content.newAccount({}, organisationName)
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

  describe('when feature flag is disabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.newAccountPage', false)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
    })

    test('returns 404', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.notFound)
    })
  })

  describe('when service charge feature flag is disabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.newAccountPage', true)
      config.set('featureFlags.serviceCharge', false)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationName = organisationName
      credentials.currentOrganisationId = organisationId
    })

    afterEach(() => {
      config.set('featureFlags.newAccountPage', false)
      config.set('featureFlags.serviceCharge', false)
    })

    test('displays the service charge card as text with due date', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.newAccount,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const serviceChargeLink = document.querySelector(
        '[data-testid="service-charge-link"]'
      )

      const serviceChargeHeading = document.querySelector(
        '[data-testid="service-charge-heading"]'
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
      expect(serviceChargeHeading).not.toBeNull()
      expect(serviceChargeHeading.textContent).toEqual(
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
      config.set('featureFlags.newAccountPage', true)
      config.set('featureFlags.serviceCharge', true)
      server = await initialiseServer()
    })

    afterEach(() => {
      config.set('featureFlags.newAccountPage', false)
      config.set('featureFlags.serviceCharge', false)
    })

    test('returns unauthorized', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.newAccount
      })

      expect(statusCode).toBe(statusCodes.unauthorized)
    })
  })
})
