import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { isWasteReceiverController } from './controller.js'

describe('#isWasteReceiverController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.skip('should redirect to search if authenticated', () => {
    let actualPath
    let actualOptions

    const request = {
      auth: {
        isAuthenticated: false
      }
    }

    const nextHandler = {
      view: (path, options) => {
        actualPath = path
        actualOptions = options
      }
    }

    isWasteReceiverController.handler(request, nextHandler)

    expect(actualPath).toBe('home/index')
    expect(actualOptions).toEqual({
      pageTitle: 'Home',
      heading: 'Home'
    })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toEqual(expect.stringContaining('Home |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
