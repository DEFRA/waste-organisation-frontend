import { timingSafeEqual } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { paths } from '../../../../config/paths.js'
import { config } from '../../../../config/config.js'
import { login } from './content.js'
import subtext from '@hapi/subtext'

export const obscureKey = 'c2472e5962be41f4a3afe1abd20b449b'
const LOGIN_COOKIE_NAME = `env-login-${obscureKey}`
const LOGIN_COOKIE_TTL_MS = 400 * 24 * 60 * 60 * 1000 // nosonar

function safeEqual(a, b) {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return timingSafeEqual(bufferA, bufferB)
}

function isValidCredentials(request, username, password) {
  const authorizationHeader =
    request?.headers?.authorization ||
    request?.headers.cookie
      ?.split(';')
      ?.map((h) => h?.trim())
      ?.find((h) => h.startsWith(LOGIN_COOKIE_NAME))
      ?.replace(`${LOGIN_COOKIE_NAME}=`, 'Basic ')

  if (!authorizationHeader?.startsWith('Basic ')) {
    return false
  }

  const encoded = authorizationHeader.slice('Basic '.length)
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
  const separatorIndex = decoded.indexOf(':')

  if (separatorIndex === -1) {
    return false
  }

  const providedUsername = decoded.slice(0, separatorIndex)
  const providedPassword = decoded.slice(separatorIndex + 1)

  return (
    safeEqual(providedUsername, username) &&
    safeEqual(providedPassword, password)
  )
}

export const basicAuth = {
  plugin: {
    name: 'basic-auth',
    register(server) {
      const username = config.get('auth.basic.username')
      const password = config.get('auth.basic.password')

      if (!password) {
        return
      }
      server.state(LOGIN_COOKIE_NAME, {
        ttl: LOGIN_COOKIE_TTL_MS,
        isSecure: config.get('session.cookie.secure'),
        isHttpOnly: true,
        isSameSite: config.get('session.cookie.sameSite'),
        path: '/',
        encoding: 'none',
        clearInvalid: true
      })

      const loginPath = `/secret/${obscureKey}/login-url`

      const callbackRe = new RegExp(
        `/public/.*|` + // nosonar
          `/.well-known/.*|` + // nosonar
          `${paths.updateSpreadsheetUploadCallback.replace(/{[^}]*}/, '[^/]*')}|` + // nosonar
          `${paths.spreadsheetUploadCallback.replace(/{[^}]*}/, '[^/]*')}|${paths.paymentCallback}` // nosonar
      )

      server.ext('onPreAuth', (request, h) => {
        if (request?.path?.match(callbackRe)) {
          return h.continue
        }
        if (isValidCredentials(request, username, password)) {
          return h.continue
        }

        if (
          request.raw.req.url ===
            `${loginPath}?username=${username}&password=${password}` ||
          request.raw.req.url ===
            `${loginPath}?password=${password}&username=${username}`
        ) {
          const token = Buffer.from(username + ':' + password).toString(
            'base64'
          )
          return h.redirect('/').state(LOGIN_COOKIE_NAME, token).takeover()
        }

        if (request.path === loginPath) {
          return h.redirect('/').takeover()
        }
        const l = login.login(request, loginPath)
        return h.view('common/plugins/auth/login-view', l).code(401).takeover()
      })

      server.ext('onRequest', async (request, h) => {
        if (request.method === 'post' && request.path === loginPath) {
          const { payload } = await subtext.parse(request.raw.req, null, {
            parse: true,
            output: 'data',
            maxBytes: 1048576,
            allow: undefined,
            override: undefined,
            defaultContentType: 'application/x-www-form-urlencoded',
            compression: {}
          })
          request.plugins.basicAuthPayload = payload
        }
        return h.continue
      })

      server.ext('onPreResponse', async (request, h) => {
        if (request.path === loginPath) {
          if (request.method === 'post') {
            try {
              const payload = request.plugins.basicAuthPayload
              if (
                username === payload.username &&
                password === payload.password
              ) {
                const token = Buffer.from(username + ':' + password).toString(
                  'base64'
                )
                return h
                  .redirect('/')
                  .state(LOGIN_COOKIE_NAME, token)
                  .takeover()
              }
            } catch (err) {
              request.logger.error(
                `Error processing post data for basic auth: ${err}`
              )
            }
            return h.redirect('/').takeover()
          } else {
            return h.redirect('/').takeover()
          }
        }

        return h.continue
      })
    }
  }
}
