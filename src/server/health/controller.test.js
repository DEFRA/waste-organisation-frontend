import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#healthController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each([paths.HEALTH, paths.CHROME_DEVTOOLS])(
    'Should provide expected response',
    async (url) => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url
      })

      expect(result).toEqual({ message: 'success' })
      expect(statusCode).toBe(statusCodes.ok)
    }
  )
})
