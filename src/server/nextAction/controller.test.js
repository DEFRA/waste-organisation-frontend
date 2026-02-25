import { initialiseServer } from '../../test-utils/initialise-server.js'
import { content } from '../../config/content.js'

import { paths, pathTo } from '../../config/paths.js'

import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

const organisationName = 'ORG NAME'

const pageContent = content.nextAction({})

describe('#nextActionController', () => {
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

  test('Should provide expected response', async () => {
    const pageContent = content.nextAction()
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.nextAction,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    const pageHeadingOrganisationName = document.querySelectorAll(
      '[data-testid="app-heading-organisation-name"]'
    )[0].textContent

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )
    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )

    expect(pageHeadingOrganisationName).toEqual(
      expect.stringContaining(organisationName)
    )
  })

  test.each(Object.entries(pageContent.questions))(
    'Should show question',
    async (key, value) => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.nextAction,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const pageHeading = document.querySelectorAll(
        `[data-testid="${key}-label"]`
      )[0].textContent

      expect(pageHeading).toEqual(expect.stringContaining(value))
    }
  )

  test('should show error message if there is an error', async () => {
    const expectedErrorMessage = pageContent.error.message

    server = await initialiseServer({
      state: {
        type: 'isNextActionError',
        message: true
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

    const errorMessage = document.querySelectorAll(
      '.govuk-error-summary__body ul li'
    )[0].textContent

    expect(errorMessage).toEqual(expect.stringContaining(expectedErrorMessage))
  })

  describe('POST', () => {
    test('should redirect to login if yes is selected', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.nextAction,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          nextAction: 'connectYourSoftware'
        }
      })

      expect(headers.location).toBe(paths.apiList)
    })

    test('should redirect to downloadSpreadsheet if downloadSpreadsheet is selected', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.nextAction,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          nextAction: 'downloadSpreadsheet'
        }
      })

      expect(headers.location).toBe(paths.downloadSpreadsheet)
    })

    test('should redirect to cannotUseService if no is selected', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.nextAction,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          nextAction: 'changeWasteReceiver'
        }
      })

      expect(headers.location).toBe(paths.signinDefraIdCallback)
    })

    test('should redirect to updateSpreadsheetUpload if updateSpreadsheet is selected', async () => {
      credentials.currentOrganisationId = 'abc-123'
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.nextAction,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          nextAction: 'updateSpreadsheet'
        }
      })

      expect(headers.location).toBe(
        pathTo(paths.updateSpreadsheetUpload, { organisationId: 'abc-123' })
      )
    })

    test.each([{}, { payload: {} }, { payload: { nextAction: 'foo' } }])(
      'should redirect to get endpoint if there is an error',
      async (payload) => {
        const { headers } = await server.inject({
          method: 'POST',
          url: paths.nextAction,
          auth: {
            strategy: 'session',
            credentials
          },
          ...payload
        })

        expect(headers.location).toBe(paths.nextAction)
      }
    )
  })
})
