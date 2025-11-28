import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { homeController } from './controller.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('should redirect to search if authenticated', () => {
    let actualUrl

    const request = {
      auth: {
        isAuthenticated: true
      }
    }

    const nextHandler = {
      redirect: (url) => (actualUrl = url)
    }

    homeController.handler(request, nextHandler)

    expect(actualUrl).toBe('/search')
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
      hideBackLink: true
    })
  })

  test('Should contain "Home" title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toEqual(expect.stringContaining('Home |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
