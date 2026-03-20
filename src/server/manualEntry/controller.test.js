import { beforeAll, afterAll, describe, expect } from 'vitest'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../config/paths.js'
import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { statusCodes } from '../common/constants/status-codes.js'

const organisationId = 'abc-123'

describe('manual entry controller', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET list page', () => {
    test('renders the list page', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.manualEntry, { organisationId }),
        auth: { strategy: 'session', credentials }
      })

      expect(statusCode).toBe(statusCodes.ok)
      const { document } = new JSDOM(payload).window
      const heading = document.querySelector(
        '[data-testid="app-heading-title"]'
      )
      expect(heading.textContent).toContain('Report waste movements')
    })

    test('shows empty message when no movements', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.manualEntry, { organisationId }),
        auth: { strategy: 'session', credentials }
      })

      const { document } = new JSDOM(payload).window
      const emptyMessage = document.querySelector(
        '[data-testid="empty-message"]'
      )
      expect(emptyMessage).toBeTruthy()
    })
  })

  describe('POST submit', () => {
    test('redirects to confirmation', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: pathTo(paths.manualEntry, { organisationId }),
        auth: { strategy: 'session', credentials },
        payload: {}
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(
        pathTo(paths.manualEntryConfirmation, { organisationId })
      )
    })
  })

  describe('GET confirmation page', () => {
    test('renders the confirmation page', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.manualEntryConfirmation, { organisationId }),
        auth: { strategy: 'session', credentials }
      })

      expect(statusCode).toBe(statusCodes.ok)
      const { document } = new JSDOM(payload).window
      const panel = document.querySelector('.govuk-panel__title')
      expect(panel.textContent).toContain('waste movements submitted')
    })

    test('shows what happens next content', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.manualEntryConfirmation, { organisationId }),
        auth: { strategy: 'session', credentials }
      })

      const { document } = new JSDOM(payload).window
      const body = document.querySelector('.govuk-grid-column-two-thirds')
      expect(body.textContent).toContain('What happens next')
      expect(body.textContent).toContain('We have received your waste movement')
    })

    test('shows return link to next action', async () => {
      const credentials = await setupAuthedUserSession(server)
      credentials.currentOrganisationId = organisationId

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.manualEntryConfirmation, { organisationId }),
        auth: { strategy: 'session', credentials }
      })

      const { document } = new JSDOM(payload).window
      const returnLink = document.querySelector('.govuk-link--no-visited-state')
      expect(returnLink.getAttribute('href')).toBe(paths.nextAction)
    })
  })
})
