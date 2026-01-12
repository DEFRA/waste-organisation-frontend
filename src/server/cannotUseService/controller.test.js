import { statusCodes } from '../common/constants/status-codes.js'
import { paths } from '../../config/paths.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'

describe('#dashboardController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.cannotUseService
    })

    expect(result).toEqual(
      expect.stringContaining('Sorry, you cannot use the service |')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
