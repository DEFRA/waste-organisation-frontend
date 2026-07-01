import { initialiseServer } from '../../test-utils/initialise-server.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { config } from '../../config/config.js'
import { wreckGetMock } from '../../test-utils/mock-oidc-config.js'
import { faker } from '@faker-js/faker'

const organisationName = 'ORG NAME'

describe('#downloadSpreadsheetController', () => {
  let server
  let credentials
  let initialServiceChargeFeatureFlag

  beforeAll(async () => {
    initialServiceChargeFeatureFlag = config.get('featureFlags.serviceCharge')
    server = await initialiseServer()
  })

  beforeEach(async () => {
    config.set('featureFlags.serviceCharge', false)
  })

  afterAll(async () => {
    config.set('featureFlags.serviceCharge', initialServiceChargeFeatureFlag)
    wreckGetMock.mockReset()
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
  })

  test('should render page with correct heading', async () => {
    const pageContent = content.downloadSpreadsheet({}, organisationName)

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.downloadSpreadsheet,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(200)

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )
  })

  test('should render organisation name', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.downloadSpreadsheet,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const organisationCaption = document.querySelectorAll(
      '[data-testid="app-heading-organisation-name"]'
    )[0].textContent

    expect(organisationCaption).toEqual(
      expect.stringContaining(organisationName)
    )
  })

  test('should render download button linking to template file', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.downloadSpreadsheet,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const downloadButton = document.querySelector(
      '[data-testid="download-spreadsheet-button"]'
    )

    expect(downloadButton).not.toBeNull()
    expect(downloadButton.getAttribute('href')).toBe(
      '/public/receipt-of-waste-template.xlsx'
    )
    expect(downloadButton.hasAttribute('download')).toBe(true)
    expect(downloadButton.getAttribute('aria-describedby')).toBe(
      'file-metadata'
    )

    const fileMetadata = document.querySelector('[data-testid="file-metadata"]')
    expect(fileMetadata.textContent).toMatch(/XLSX, [0-9]*KB/)
  })

  test('should render return link to next action page', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.downloadSpreadsheet,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const returnLink = document.querySelector('[data-testid="return-link"]')

    expect(returnLink).not.toBeNull()
    expect(returnLink.getAttribute('href')).toBe(paths.nextAction)
    expect(returnLink.textContent).toEqual(
      expect.stringContaining(`Return to ${organisationName}`)
    )
  })

  test('page does not show important notice when service feature is disabled', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.nextAction,
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

  test('page does not show important notice when service is paid', async () => {
    config.set('featureFlags.serviceCharge', true)
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
      url: paths.nextAction,
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
    config.set('featureFlags.serviceCharge', true)
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
      url: paths.nextAction,
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
})
