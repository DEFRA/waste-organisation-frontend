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
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.SEARCH
    })

    expect(result).toEqual(expect.stringContaining('Search |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
