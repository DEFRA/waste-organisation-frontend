import { timingSafeEqual } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { paths } from '../../../../config/paths.js'
import { config } from '../../../../config/config.js'

function safeEqual(a, b) {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return timingSafeEqual(bufferA, bufferB)
}

function isValidCredentials(authorizationHeader, username, password) {
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

      const callbackRe = new RegExp(
        `${paths.updateSpreadsheetUploadCallback.replace(/{[^}]*}/, '[^/]*')}|${paths.spreadsheetUploadCallback.replace(/{[^}]*}/, '[^/]*')}`
      )

      server.ext('onRequest', (request, h) => {
        if (
          isValidCredentials(
            request.headers.authorization,
            username,
            password
          ) ||
          request?.path?.match(callbackRe)
        ) {
          return h.continue
        }

        return h
          .response('Unauthorized')
          .code(401)
          .header('WWW-Authenticate', 'Basic realm="Access restricted"')
          .takeover()
      })
    }
  }
}
