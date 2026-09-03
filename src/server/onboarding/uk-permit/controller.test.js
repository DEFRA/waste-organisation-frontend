import { expect, test } from 'vitest'
import { initialiseServer } from '../../../test-utils/initialise-server'
import { setupAuthedUserSession } from '../../../test-utils/session-helper'
import { paths } from '../../../config/paths'
import { statusCodes } from '../../common/constants/status-codes'
import { JSDOM } from 'jsdom'
import { onboarding } from '../content'
import { config } from '../../../config/config.js'

describe('ukPermit', () => {
  let server
  let initialWelshLanguageFlag
  const pageContent = onboarding.ukPermit({})

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    server = await initialiseServer()
  })

  afterEach(() => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    await server.stop({ timeout: 0 })
  })

  describe('GET', () => {
    test('should redirect to account if user is signed in', async () => {
      const credentials = await setupAuthedUserSession(server)
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: paths.ukPermit,
        auth: { strategy: 'session', credentials }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(paths.account)
    })

    test('should render the correct content on the page', async () => {
      const { payload } = await server.inject({
        method: 'GET',
        url: paths.ukPermit
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

    test('should render Welsh content when lang=cy', async () => {
      config.set('featureFlags.welshLanguage', true)

      const welshContent = onboarding.ukPermit({ locale: 'cy' })
      const { payload } = await server.inject({
        method: 'GET',
        url: `${paths.ukPermit}?lang=cy`
      })

      const { document } = new JSDOM(payload).window

      expect(document.title).toEqual(
        expect.stringContaining(`${welshContent.title} |`)
      )
      expect(
        document.querySelector('[data-testid="app-heading-title"]').textContent
      ).toEqual(expect.stringContaining(welshContent.heading.text))
    })

    test('should show error message if there is an error', async () => {
      const expectedErrorMessage = pageContent.error.message
      server.injectYarState({ type: 'isPermitError', message: true })

      const { payload } = await server.inject({
        method: 'GET',
        url: paths.ukPermit
      })

      const { document } = new JSDOM(payload).window

      const errorMessage = document.querySelectorAll(
        '.govuk-error-summary__body ul li'
      )[0].textContent

      expect(document.title).toEqual(
        expect.stringContaining(`${pageContent.error.pageTitle} |`)
      )

      expect(errorMessage).toEqual(
        expect.stringContaining(expectedErrorMessage)
      )
    })

    test.each(Object.entries(pageContent.questions))(
      'Should show question',
      async (key, value) => {
        const { payload } = await server.inject({
          method: 'GET',
          url: paths.ukPermit
        })

        const { document } = new JSDOM(payload).window

        const radioLabel = document.querySelectorAll(
          `[data-testid="${key}-label"]`
        )[0].textContent

        expect(radioLabel).toEqual(expect.stringContaining(value))
      }
    )
  })

  describe('POST', () => {
    test('should redirect to login if yes is selected', async () => {
      let lastRequest
      server.ext('onPreResponse', (request, h) => {
        lastRequest = request
        return h.continue
      })

      const { headers } = await server.inject({
        method: 'POST',
        url: paths.ukPermit,
        payload: {
          isPermit: 'no'
        }
      })

      expect(headers.location).toBe(paths.signinDefraIdCallback)
      const [isLocalAuthority] = lastRequest.yar.flash('isLocalAuthority')
      expect(isLocalAuthority).toBeFalsy()
    })

    test('should redirect to cannotUseService if no is selected', async () => {
      let lastRequest
      server.ext('onPreResponse', (request, h) => {
        lastRequest = request
        return h.continue
      })
      const { headers } = await server.inject({
        method: 'POST',
        url: paths.ukPermit,
        payload: {
          isPermit: 'yes'
        }
      })

      expect(headers.location).toBe(paths.localAuthorityGuidance)
      const [isLocalAuthority] = lastRequest.yar.flash('isLocalAuthority')
      expect(isLocalAuthority).toBeTruthy()
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
