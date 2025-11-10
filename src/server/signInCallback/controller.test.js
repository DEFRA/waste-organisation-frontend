import { test } from 'vitest'
import { paths } from '../../config/paths.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'

test.skip('user not signed in', async () => {
  const server = await initialiseServer({ domain: 'http://example.com' })

  const { headers, statusCode } = await server.inject({
    method: 'get',
    url: paths.SIGNIN_DEFRA_ID_CALLBACK
  })

  const actualURL = new URL(headers.location)
  const expectedURL = new URL('http://example.com/path')

  expect(statusCode).toBe(302)
  expect(actualURL.origin).toBe(expectedURL.origin)
})
