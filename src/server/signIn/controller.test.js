import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { paths } from '../../config/paths.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { wreckGetMock } from '../../test-utils/mock-oidc-config.js'
import { config } from '../../config/config.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('signIn', () => {
  const domain = 'http://localhost:2'
  let server

  beforeEach(async () => {
    server = await initialiseServer({ domain })
  })

  afterEach(async () => {
    await server.stop()
  })

  test.each([
    {
      url: paths.signinDefraIdCallback,
      oidcConfigurationUrl: 'auth.defraId.oidcConfigurationUrl'
    }
  ])(
    'user redirected to Auth Provider when not logged in',
    async ({ url, oidcConfigurationUrl }) => {
      const { headers, statusCode } = await server.inject({
        method: 'get',
        url
      })

      const configUrl = config.get(oidcConfigurationUrl)

      const actualURL = new URL(headers.location)
      const expectedURL = new URL(domain)

      expect(wreckGetMock).toBeCalledWith(configUrl, {
        json: 'strict'
      })
      expect(statusCode).toBe(302)
      expect(actualURL.origin).toBe(expectedURL.origin)
    }
  )

  test.each([{ url: paths.signinDefraIdCallback, strategy: 'defraId' }])(
    'user redirected to search when logged in',
    async ({ url, strategy }) => {
      const credentials = await setupAuthedUserSession(server)

      const { headers, statusCode } = await server.inject({
        method: 'get',
        url,
        auth: {
          strategy,
          credentials
        }
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe(paths.search)
    }
  )
})
