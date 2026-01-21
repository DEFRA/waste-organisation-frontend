import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { homeController } from './controller.js'
import { paths } from '../../config/paths.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('should render page if not authenticated', () => {
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

    homeController.handler(request, nextHandler)

    expect(actualPath).toBe('home/index')
    expect(actualOptions).toEqual({
      pageTitle: 'Home',
      heading: 'Home',
      startNowLink: paths.ukPermit
    })
  })

  test('Should contain "Home" title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.startPage
    })

    expect(result).toEqual(expect.stringContaining('Home |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
