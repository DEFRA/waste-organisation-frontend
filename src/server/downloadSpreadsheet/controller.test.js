import { initialiseServer } from '../../test-utils/initialise-server.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const organisationName = 'ORG NAME'

describe('#downloadSpreadsheetController', () => {
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
})
