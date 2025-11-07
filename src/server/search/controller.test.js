import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { paths } from '../../config/paths.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.SEARCH
    })

    expect(statusCode).toBe(statusCodes.unauthorized)
  })
})
