import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { onboardingGetController } from './controller.js'
import { paths } from '../../config/paths.js'

const testOrganisationId = '9c6a06d7-e691-4740-89a2-a64d23478034'
const testOrganisationName = 'Monkey Barrel LTD'

const backendApi = {
  getOrganisations: async (_) => [
    {
      name: testOrganisationName,
      id: testOrganisationId
    }
  ]
}

describe('#onboardingController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('should redirect with query string when no org is given', async () => {
    let actualUrl

    const request = {
      auth: {
        isAuthenticated: true
      },
      backendApi
    }

    const nextHandler = {
      redirect: (url) => (actualUrl = url)
    }

    await onboardingGetController.handler(request, nextHandler)

    expect(actualUrl).toBe(
      `${paths.onboarding}?organsiationId=${testOrganisationId}`
    )
  })

  test('should render page if organisationId is found', async () => {
    let actualPath
    let actualOptions

    const request = {
      auth: {
        isAuthenticated: false
      },
      query: {
        organsiationId: testOrganisationId
      },
      backendApi
    }

    const nextHandler = {
      view: (path, options) => {
        console.log(path)
        actualPath = path
        actualOptions = options
      }
    }

    await onboardingGetController.handler(request, nextHandler)

    console.log(actualPath)

    expect(actualPath).toBe('isWasteReceiver/index')
    expect(actualOptions).toEqual({
      pageTitle: 'Report receipt of waste',
      question: `Is ${testOrganisationName} a waste receiver?`,
      action: paths.isWasteReceiver,
      errors: null
    })
  })

  test.skip('Should contain "Home" title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toEqual(expect.stringContaining('Home |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
