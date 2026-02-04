import { expect, test } from 'vitest'
import { initialiseServer } from '../../../test-utils/initialise-server'
import { paths, pathTo } from '../../../config/paths'
import { JSDOM } from 'jsdom'
import { content } from '../../../config/content'
import { faker } from '@faker-js/faker'
import { setupAuthedUserSession } from '../../../test-utils/session-helper'
const organisationName = 'ORG NAME'

describe('apiDisable', () => {
  let server
  let credentials
  const pageContent = content.apiDisable({}, 'OrgName')

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

  describe('GET', () => {
    test('should render the correct content on the page', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiDisable, {
          apiCode: faker.string.uuid()
        }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const pageHeading = document.querySelectorAll(
        '[data-testid="app-heading-title"]'
      )[0].textContent

      expect(document.title).toEqual(
        expect.stringContaining(`${pageContent.title} |`)
      )
      expect(pageHeading).toEqual(
        expect.stringContaining(pageContent.heading.text)
      )
    })

    test('should show error message if there is an error', async () => {
      const expectedErrorMessage = pageContent.error.message

      server = await initialiseServer({
        state: {
          type: 'disableError',
          message: true
        }
      })

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiDisable, {
          apiCode: faker.string.uuid()
        }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const errorMessage = document.querySelectorAll(
        '.govuk-error-summary__body ul li'
      )[0].textContent

      expect(errorMessage).toEqual(
        expect.stringContaining(expectedErrorMessage)
      )
    })

    test.each(Object.entries(pageContent.questions))(
      'Should show question',
      async (key, value) => {
        const { payload } = await server.inject({
          method: 'GET',
          url: pathTo(paths.apiDisable, {
            apiCode: faker.string.uuid()
          }),
          auth: {
            strategy: 'session',
            credentials
          }
        })

        const { document } = new JSDOM(payload).window

        const radioLabel = document.querySelectorAll(
          `[data-testid="${key}-label"]`
        )[0].textContent

        expect(radioLabel).toEqual(expect.stringContaining(value))
      }
    )
  })

  // describe('POST', () => {
  //   test('should redirect to login if yes is selected', async () => {
  //     const { headers } = await server.inject({
  //       method: 'POST',
  //       url: paths.ukPermit,
  //       payload: {
  //         isPermit: 'yes'
  //       }
  //     })

  //     expect(headers.location).toBe(paths.signinDefraIdCallback)
  //   })

  //   test('should redirect to cannotUseService if no is selected', async () => {
  //     const { headers } = await server.inject({
  //       method: 'POST',
  //       url: paths.ukPermit,
  //       payload: {
  //         isPermit: 'no'
  //       }
  //     })

  //     expect(headers.location).toBe(paths.cannotUseService)
  //   })

  //   test.each([{}, { payload: {} }, { payload: { isPermit: 'foo' } }])(
  //     'should redirect to get endpoint if there is an error',
  //     async (payload) => {
  //       const { headers } = await server.inject({
  //         method: 'POST',
  //         url: paths.ukPermit,
  //         ...payload
  //       })

  //       expect(headers.location).toBe(paths.ukPermit)
  //     }
  //   )
  // })
})
