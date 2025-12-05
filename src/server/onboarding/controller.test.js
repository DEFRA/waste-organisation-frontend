import { initialiseServer } from '../../test-utils/initialise-server.js'
import { onboardingGetController, waitFor } from './controller.js'
import { paths } from '../../config/paths.js'
import { expect } from 'vitest'

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
        actualPath = path
        actualOptions = options
      }
    }

    await onboardingGetController.handler(request, nextHandler)

    expect(actualPath).toBe('isWasteReceiver/index')
    expect(actualOptions).toEqual({
      pageTitle: 'Report receipt of waste',
      question: `Is ${testOrganisationName} a waste receiver?`,
      action: paths.isWasteReceiver,
      errors: null
    })
  })
})

describe('waitForNewOrganisations', () => {
  test.each([
    {
      // tests function called multiple times within waitTime
      waitTime: 50,
      iteration: 5,
      delay: 20,
      callsUntilData: 5,
      times: 3,
      response: null
    },
    {
      // calls once if delay is too big
      waitTime: 50,
      iteration: 5,
      delay: 51,
      callsUntilData: 5,
      times: 1,
      response: null
    },
    {
      // calls once if data is returned on first time
      waitTime: 50,
      iteration: 10,
      delay: 1,
      callsUntilData: 1,
      times: 1,
      response: 'fish'
    },
    {
      // calls twice if data is returned on second time
      waitTime: 50,
      iteration: 10,
      delay: 1,
      callsUntilData: 2,
      times: 2,
      response: 'fish'
    }
  ])(
    'should call function correct ammount of times',
    async ({ waitTime, iteration, delay, callsUntilData, times, response }) => {
      let timesCalled = 0

      const mockFunction = {
        get: (_) => {
          timesCalled++
          if (timesCalled < callsUntilData) return null
          return 'fish'
        }
      }

      const result = await waitFor({
        func: async () => mockFunction.get('userID'),
        waitTime,
        iteration,
        delay
      })

      expect(timesCalled).toBe(times)
      expect(result).toBe(response)
    }
  )
})
