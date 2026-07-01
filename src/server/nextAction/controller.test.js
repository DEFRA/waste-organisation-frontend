import { initialiseServer } from '../../test-utils/initialise-server.js'
import { content } from '../../config/content.js'

import { paths, pathTo } from '../../config/paths.js'

import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { config } from '../../config/config.js'
import { wreckGetMock } from '../../test-utils/mock-oidc-config.js'
import { faker } from '@faker-js/faker'

const organisationName = 'ORG NAME'

const pageContent = content.nextAction({})

describe('#nextActionController', () => {
  let server
  let credentials
  let initialServiceChargeFeatureFlag
  beforeAll(async () => {
    server = await initialiseServer()
    initialServiceChargeFeatureFlag = config.get('featureFlags.serviceCharge')
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
    config.set('featureFlags.serviceCharge', initialServiceChargeFeatureFlag)
    wreckGetMock.mockReset()
  })

  test('Should provide expected response', async () => {
    config.set('featureFlags.serviceCharge', false)
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
      config.set('featureFlags.serviceCharge', false)
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

  test.each(Object.entries(pageContent.questionsNotPaid))(
    'Should show not paid question if service charge is not paid',
    async (key, value) => {
      config.set('featureFlags.serviceCharge', true)

      wreckGetMock.mockReturnValue({
        payload: {
          organisation: {
            organisationId: 'orgid',
            disableAfter: faker.date.past(),
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

      const pageHeading = document.querySelectorAll(
        `[data-testid="${key}-label"]`
      )[0].textContent

      expect(pageHeading).toEqual(expect.stringContaining(value))

      const radioCount = document.querySelectorAll('.govuk-radios__item').length

      expect(radioCount).toEqual(
        Object.entries(pageContent.questionsNotPaid).length
      )
    }
  )

  test.each(Object.entries(pageContent.questions))(
    'Should all question if service charge is paid',
    async (key, value) => {
      config.set('featureFlags.serviceCharge', true)

      wreckGetMock.mockReturnValue({
        payload: {
          organisation: {
            organisationId: 'orgid',
            disableAfter: faker.date.future(),
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

      const pageHeading = document.querySelectorAll(
        `[data-testid="${key}-label"]`
      )[0].textContent

      expect(pageHeading).toEqual(expect.stringContaining(value))

      const radioCount = document.querySelectorAll('.govuk-radios__item').length

      expect(radioCount).toEqual(Object.entries(pageContent.questions).length)
    }
  )

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

  test('should show back link to account when account page flag is on', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.nextAction,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const backLink = document.querySelector('[data-testid="back-link"]')

    expect(backLink.getAttribute('href')).toBe(paths.account)
  })

  test('should show error message if there is an error', async () => {
    const expectedErrorMessage = pageContent.error.message
    server.injectYarState({ type: 'isNextActionError', message: true })

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
