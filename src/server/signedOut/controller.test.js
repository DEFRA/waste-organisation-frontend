import { statusCodes } from '../common/constants/status-codes.js'
import { paths } from '../../config/paths.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'

describe('#signedOutController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should render signed out page with correct title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signedOut
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('You have been signed out'))
    expect(result).toEqual(expect.stringContaining('Sign in'))
    expect(result).toEqual(expect.stringContaining(`href="${paths.ukPermit}"`))
  })
})
