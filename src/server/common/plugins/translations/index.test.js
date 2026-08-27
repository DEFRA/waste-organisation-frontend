import hapi from '@hapi/hapi'
import { translation } from './index.js'
import { LANGUAGE_COOKIE_NAME } from './resolve-locale.js'

describe('#translation plugin', () => {
  let server

  beforeEach(async () => {
    server = hapi.server()
    await server.register(translation)
    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => h.response({ locale: request.locale })
    })
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  test('defaults to English', async () => {
    const { result, headers } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result.locale).toBe('en')
    expect(languageCookie(headers)).toBeUndefined()
  })

  test('uses the lang query param and sets the language cookie', async () => {
    const { result, headers } = await server.inject({
      method: 'GET',
      url: '/?lang=cy'
    })

    expect(result.locale).toBe('cy')
    expect(languageCookie(headers)).toEqual(
      expect.stringContaining(`${LANGUAGE_COOKIE_NAME}=cy`)
    )
    expect(languageCookie(headers)).toEqual(expect.stringContaining('HttpOnly'))
    expect(languageCookie(headers)).toEqual(
      expect.stringContaining('SameSite=Lax')
    )
    expect(languageCookie(headers)).toEqual(expect.stringContaining('Path=/'))
    expect(languageCookie(headers)).not.toEqual(
      expect.stringContaining('Domain=')
    )
  })

  test('ignores an invalid lang query param', async () => {
    const { result, headers } = await server.inject({
      method: 'GET',
      url: '/?lang=fr'
    })

    expect(result.locale).toBe('en')
    expect(languageCookie(headers)).toBeUndefined()
  })

  test('uses the language cookie when the query param is absent', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        cookie: `${LANGUAGE_COOKIE_NAME}=cy`
      }
    })

    expect(result.locale).toBe('cy')
  })

  test('prefers the query param over the cookie', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: '/?lang=en',
      headers: {
        cookie: `${LANGUAGE_COOKIE_NAME}=cy`
      }
    })

    expect(result.locale).toBe('en')
  })

  test('uses Accept-Language when query and cookie are absent', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        'accept-language': 'cy,en;q=0.8'
      }
    })

    expect(result.locale).toBe('cy')
  })
})

function languageCookie(headers) {
  const setCookie = headers['set-cookie']
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]

  return cookies.find((cookie) =>
    cookie?.startsWith(`${LANGUAGE_COOKIE_NAME}=`)
  )
}
