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
      config.set('featureFlags.accountPage', true)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationName = organisationName
    })

    afterEach(() => {
      config.set('featureFlags.accountPage', false)
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

      const orgName = document.querySelector('.govuk-caption-l').textContent

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

    test('displays the service charge card with tag', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.account,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const serviceChargeText = document.querySelector(
        '[data-testid="service-charge-text"]'
      )

      expect(serviceChargeText).not.toBeNull()
      expect(serviceChargeText.textContent).toEqual(
        expect.stringContaining('Service charge')
      )

      expect(payload).toEqual(expect.stringContaining('Due October 2026'))
    })
  })

  describe('when feature flag is disabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.accountPage', false)
      server = await initialiseServer()
      credentials = await setupAuthedUserSession(server)
    })

    test('redirects to next action page', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: paths.account,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(paths.nextAction)
    })
  })

  describe('when not authenticated', () => {
    beforeEach(async () => {
      config.set('featureFlags.accountPage', true)
      server = await initialiseServer()
    })

    afterEach(() => {
      config.set('featureFlags.accountPage', false)
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
