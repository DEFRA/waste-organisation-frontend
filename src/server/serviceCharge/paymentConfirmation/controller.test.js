import { JSDOM } from 'jsdom'
import { config } from '../../../config/config'
import { paths } from '../../../config/paths.js'
import {
  initialiseServer,
  wreckPostMock
} from '../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { expect } from 'vitest'
import { content } from '../../../config/content.js'

describe('#paymentDetailsController', () => {
  let server
  let credentials

  beforeEach(async () => {
    wreckPostMock.mockReset()
    config.set('featureFlags.serviceCharge', true)
    server = await initialiseServer()
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'org-1'
    config.set('featureFlags.serviceCharge', false)
    await server.stop({ timeout: 0 })
  })

  test('renders payment confirmation page whern a payment is successful', async () => {
    const pageContent = content.paymentDetails(
      {},
      2500,
      credentials.currentOrganisationName
    ).success

    server.setYarState({ type: 'govPayPaymentId', message: 'paymentID' })

    wreckPostMock.mockReturnValue({
      payload: {
        payment: {
          status: 'payment_succeeded',
          amount: 2500
        }
      }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.ok)

    const { document } = new JSDOM(payload).window

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )

    expect(pageHeading).toEqual(expect.stringContaining('HDJ3233F'))
  })

  test('renders payment confirmation page whern a payment is pending', async () => {
    const pageContent = content.paymentDetails(
      {},
      2500,
      credentials.currentOrganisationName
    ).pending

    server.setYarState({ type: 'govPayPaymentId', message: 'paymentID' })

    wreckPostMock.mockReturnValue({
      payload: {
        payment: {
          status: 'payment_in_progress',
          amount: 2500
        }
      }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.ok)

    const { document } = new JSDOM(payload).window

    expectPageContentIsCorrect(document, pageContent)
  })

  test('renders payment confirmation page whern a payment is Declined', async () => {
    const pageContent = content.paymentDetails(
      {},
      3500,
      credentials.currentOrganisationName
    ).declined

    server.setYarState({ type: 'govPayPaymentId', message: 'paymentID' })

    wreckPostMock.mockReturnValue({
      payload: {
        payment: {
          status: 'payment_failed'
        }
      }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.ok)

    const { document } = new JSDOM(payload).window

    expectPageContentIsCorrect(document, pageContent)
  })

  test('redirects to accout page when payment id is missing', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.account)
  })

  test.each(['payment_unknown', 'bob', '', undefined, null])(
    'redirects to accout page when payment status is unknown',
    async (status) => {
      server.setYarState({ type: 'govPayPaymentId', message: 'paymentID' })

      wreckPostMock.mockReturnValue({
        payload: {
          payment: {
            status
          }
        }
      })

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: paths.paymentDetails,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(paths.account)
    }
  )

  test('returns unauthorized when not authenticated', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})

const expectPageContentIsCorrect = (actual, expected) => {
  const pageHeading = actual.querySelectorAll(
    '[data-testid="app-heading-title"]'
  )[0].textContent

  const pageHeadingOrganisationName = actual.querySelectorAll(
    '[data-testid="app-heading-organisation-name"]'
  )[0].textContent

  const pageSummary = actual.querySelectorAll(
    '[data-testid="payment-pending-summaryContent"]'
  )[0].textContent

  const returnLink = actual.querySelectorAll(
    '[data-testid="payment-return-link"]'
  )[0].textContent

  expect(pageHeading).toEqual(expect.stringContaining(expected.heading.text))
  expect(pageHeadingOrganisationName).toEqual(
    expect.stringContaining(expected.heading.organisationName)
  )
  expect(pageSummary).toEqual(expect.stringContaining(expected.summaryContent))
  expect(returnLink).toEqual(
    expect.stringContaining(expected.returnToAccountLabel)
  )
}
