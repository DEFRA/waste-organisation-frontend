import { statusCodes } from '../common/constants/status-codes.js'
import { paths } from '../../config/paths.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const credentials = await setupAuthedUserSession(server)

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.search,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(result).toEqual(expect.stringContaining('Search |'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should provide expected response', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.search
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
