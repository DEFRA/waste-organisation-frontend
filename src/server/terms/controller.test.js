import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { expect } from 'vitest'

describe('#termsController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 with the correct page title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Terms |'))
  })

  test('Should have a link to terms in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(result).toEqual(expect.stringContaining('href="/terms"'))
  })
})
