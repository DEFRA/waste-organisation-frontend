import { expect, test } from 'vitest'
import { initialiseServer } from '../../../test-utils/initialise-server'
import { paths } from '../../../config/paths'
import { JSDOM } from 'jsdom'
import { content } from '../../../config/content'

describe('ukPermit', () => {
  let server
  const pageContent = content.ukPermit()

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET', () => {
    test('should render the correct content on the page', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.ukPermit
      })

      const { document } = new JSDOM(payload).window

      const pageHeading = document.querySelectorAll(
        'h1.govuk-fieldset__heading'
      )[0].textContent

      expect(document.title).toBe(
        `${pageContent.title} | Report receipt of waste`
      )
      expect(pageHeading).toEqual(expect.stringContaining(pageContent.heading))
    })

    test('should show error message if there is an error', async () => {
      const expectedErrorMessage = pageContent.error.message

      server = await initialiseServer({
        state: {
          type: 'isPermitError',
          message: true
        }
      })

      const { payload } = await server.inject({
        method: 'GET',
        url: paths.ukPermit
      })

      const { document } = new JSDOM(payload).window

      const errorMessage = document.querySelectorAll(
        '.govuk-error-summary__body ul li'
      )[0].textContent

      expect(errorMessage).toEqual(
        expect.stringContaining(expectedErrorMessage)
      )
    })
  })

  describe('POST', () => {
    test('should redirect to login if yes is selected', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.ukPermit,
        payload: {
          isPermit: 'yes'
        }
      })

      expect(headers.location).toBe(paths.signinDefraIdCallback)
    })

    test('should redirect to cannotUseService if no is selected', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.ukPermit,
        payload: {
          isPermit: 'no'
        }
      })

      expect(headers.location).toBe(paths.cannotUseService)
    })

    test.each([{}, { payload: {} }, { payload: { isPermit: 'foo' } }])(
      'should redirect to get endpoint if there is an error',
      async (payload) => {
        const { headers } = await server.inject({
          method: 'POST',
          url: paths.ukPermit,
          ...payload
        })

        expect(headers.location).toBe(paths.ukPermit)
      }
    )
  })
})
