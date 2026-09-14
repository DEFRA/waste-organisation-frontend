import { vi } from 'vitest'
import { JSDOM } from 'jsdom'

import { catchAll } from './errors.js'
import { statusCodes } from '../constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { authentication } from '../../authentication/content.js'
import { errors } from '../../error/content.js'
import { LANGUAGE_COOKIE_NAME } from '../plugins/translations/resolve-locale.js'

describe('#errors', () => {
  let server
  let initialWelshLanguageFlag

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    config.set('featureFlags.welshLanguage', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    await server?.stop({ timeout: 0 })
  })

  test('Should provide expected Not Found page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/non-existent-path'
    })

    expect(result).toEqual(
      expect.stringContaining('Page not found | Report receipt of waste')
    )
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('Should provide a Welsh unauthorised page when lang=cy', async () => {
    const unauthorizedContent = authentication.unauthorized({ locale: 'cy' })
    const { payload, statusCode, headers } = await server.inject({
      method: 'GET',
      url: `${paths.account}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.unauthorized)
    expect(document.documentElement.lang).toBe('cy')
    expect(document.querySelector('h1').textContent).toBe(
      unauthorizedContent.heading
    )
    expect(languageCookie(headers)).toEqual(
      expect.stringContaining(`${LANGUAGE_COOKIE_NAME}=cy`)
    )
  })

  test('Should provide a Welsh unauthorised page when the language cookie is cy', async () => {
    const unauthorizedContent = authentication.unauthorized({ locale: 'cy' })
    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: paths.account,
      headers: {
        cookie: `${LANGUAGE_COOKIE_NAME}=cy`
      }
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.unauthorized)
    expect(document.documentElement.lang).toBe('cy')
    expect(document.querySelector('h1').textContent).toBe(
      unauthorizedContent.heading
    )
  })
})

describe('#catchAll', () => {
  const mockErrorLogger = vi.fn()
  const mockStack = 'Mock error stack'
  const errorPage = 'error/index'
  const mockRequest = (statusCode, locale) => ({
    response: {
      isBoom: true,
      stack: mockStack,
      output: {
        statusCode
      }
    },
    logger: { error: mockErrorLogger },
    locale
  })
  const mockToolkitView = vi.fn()
  const mockToolkitCode = vi.fn()
  const mockToolkit = {
    view: mockToolkitView.mockReturnThis(),
    code: mockToolkitCode.mockReturnThis()
  }

  test('Should provide expected "Not Found" page', () => {
    catchAll(mockRequest(statusCodes.notFound), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Page not found',
      heading: statusCodes.notFound,
      message: 'Page not found'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(statusCodes.notFound)
  })

  test('Should provide a Welsh "Not Found" page when locale is cy', () => {
    const content = errors.notFound({ locale: 'cy' })

    catchAll(mockRequest(statusCodes.notFound, 'cy'), mockToolkit)

    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: content.pageTitle,
      heading: statusCodes.notFound,
      message: content.message
    })
  })

  test('Should provide expected "Forbidden" page', () => {
    catchAll(mockRequest(statusCodes.forbidden), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Forbidden',
      heading: statusCodes.forbidden,
      message: 'Forbidden'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(statusCodes.forbidden)
  })

  test('Should provide expected "Unauthorized" page with content', () => {
    catchAll(mockRequest(statusCodes.unauthorized), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith('error/unauthorized', {
      pageTitle: 'You do not have permission to view this page',
      heading: 'You do not have permission to view this page',
      reasonsIntro: 'This could be because:',
      reasons: ['you are not signed in', 'your session expired'],
      action: 'Try signing in again or contact the support team for more help.',
      signInButton: 'Sign in',
      signInUrl: '/signin-oidc'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(statusCodes.unauthorized)
  })

  test('Should provide a Welsh "Unauthorized" page when locale is cy', () => {
    const unauthorizedContent = authentication.unauthorized({ locale: 'cy' })

    catchAll(mockRequest(statusCodes.unauthorized, 'cy'), mockToolkit)

    expect(mockToolkitView).toHaveBeenCalledWith('error/unauthorized', {
      pageTitle: unauthorizedContent.title,
      heading: unauthorizedContent.heading,
      reasonsIntro: unauthorizedContent.reasonsIntro,
      reasons: unauthorizedContent.reasons,
      action: unauthorizedContent.action,
      signInButton: unauthorizedContent.signInButton,
      signInUrl: '/signin-oidc'
    })
  })

  test('Should provide expected "Bad Request" page', () => {
    catchAll(mockRequest(statusCodes.badRequest), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Bad Request',
      heading: statusCodes.badRequest,
      message: 'Bad Request'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('Should provide expected default page', () => {
    catchAll(mockRequest(statusCodes.imATeapot), mockToolkit)

    expect(mockErrorLogger).not.toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith(errorPage, {
      pageTitle: 'Something went wrong',
      heading: statusCodes.imATeapot,
      message: 'Something went wrong'
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(statusCodes.imATeapot)
  })

  test('Should provide expected "Problem with service" page and log error for internalServerError', () => {
    const content = errors.internalServerError({})

    catchAll(mockRequest(statusCodes.internalServerError), mockToolkit)

    expect(mockErrorLogger).toHaveBeenCalledWith(mockStack)
    expect(mockToolkitView).toHaveBeenCalledWith('error/500', {
      pageTitle: content.title,
      heading: content.heading,
      body: content.body
    })
    expect(mockToolkitCode).toHaveBeenCalledWith(
      statusCodes.internalServerError
    )
  })

  test('Should provide a Welsh "Problem with service" page when locale is cy', () => {
    const content = errors.internalServerError({ locale: 'cy' })

    catchAll(mockRequest(statusCodes.internalServerError, 'cy'), mockToolkit)

    expect(mockToolkitView).toHaveBeenCalledWith('error/500', {
      pageTitle: content.title,
      heading: content.heading,
      body: content.body
    })
  })
})

function languageCookie(headers) {
  const setCookie = headers['set-cookie']
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]

  return cookies.find((cookie) =>
    cookie?.startsWith(`${LANGUAGE_COOKIE_NAME}=`)
  )
}
