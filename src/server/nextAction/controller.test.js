import { initialiseServer } from '../../test-utils/initialise-server.js'
import { content } from '../../config/content.js'

import { paths } from '../../config/paths.js'

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
})
