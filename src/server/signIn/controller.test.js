import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { paths } from '../../config/paths.js'
import {
  initialiseServer,
  wreckGetMock,
  wreckPutMock
} from '../../test-utils/initialise-server.js'
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
    'user redirected to account page when logged in',
    async ({ url, strategy }) => {
      const credentials = await setupAuthedUserSession(server)
      credentials.profile = [
        'id',
        'currentOrganisationId',
        'currentOrganisationName'
      ].reduce((acc, k) => {
        if (k in credentials) {
          acc[k] = credentials[k]
        }
        return acc
      }, {})
      delete credentials['id']
      delete credentials['currentOrganisationId']
      delete credentials['currentOrganisationName']

      const { headers, statusCode } = await server.inject({
        method: 'get',
        url,
        auth: {
          strategy,
          credentials
        }
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe(paths.account)
      expect(wreckPutMock).toBeCalledWith(
        `http://localhost/TODO/user/${credentials.profile.id}/organisation/${credentials.profile.currentOrganisationId}`,
        {
          headers: {
            'x-auth-token': 'abc123'
          },
          json: 'strict',
          payload: {
            organisation: {
              name: credentials.profile.currentOrganisationName
            }
          }
        }
      )
    }
  )
})
