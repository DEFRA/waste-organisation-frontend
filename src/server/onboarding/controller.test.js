import { initialiseServer } from '../../test-utils/initialise-server.js'
import {
  isWasteReceiverGetController,
  onboardingGetController,
  waitFor
} from './controller.js'
import { paths, pathTo } from '../../config/paths.js'
import { faker } from '@faker-js/faker'
import boom from '@hapi/boom'

const fakeOrg = (override) => ({
  organisationId: faker.string.uuid(),
  users: [faker.string.uuid()],
  name: faker.company.name(),
  isWasteReceiver: faker.datatype.boolean(),
  ...override
})

const backendApi = (getOrganisationsResponse) => ({
  getOrganisations: async (_) => getOrganisationsResponse
})

describe('#onboardingController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('onboardingGetController', () => {
    test('should redirect to is-waste-receiver page when at least one org is unknown', async () => {
      let actualUrl

      const wasteRecievers = [fakeOrg({ isWasteReceiver: true })]
      const notWasteRecievers = [fakeOrg({ isWasteReceiver: false })]
      const unknownOrgs = [fakeOrg({ isWasteReceiver: null })]
      const userId = faker.string.uuid()

      const request = {
        auth: {
          isAuthenticated: true,
          credentials: { id: userId }
        },
        backendApi: backendApi([
          ...wasteRecievers,
          ...notWasteRecievers,
          ...unknownOrgs
        ])
      }

      const nextHandler = {
        redirect: (url) => (actualUrl = url),
        view: (_path, _options) => {}
      }

      await onboardingGetController.handler(request, nextHandler)

      expect(actualUrl).toBe(pathTo(paths.isWasteReceiver, unknownOrgs[0]))
    })

    test('should redirect to dashboard if there is a waste receiver', async () => {
      let actualUrl

      const wasteRecievers = [fakeOrg({ isWasteReceiver: true })]
      const notWasteRecievers = [fakeOrg({ isWasteReceiver: false })]
      const userId = faker.string.uuid()

      const request = {
        auth: {
          isAuthenticated: true,
          credentials: { id: userId }
        },
        backendApi: backendApi([...wasteRecievers, ...notWasteRecievers])
      }

      const nextHandler = {
        redirect: (url) => (actualUrl = url),
        view: (_path, _options) => {}
      }

      await onboardingGetController.handler(request, nextHandler)

      expect(actualUrl).toBe(paths.dashboard)
    })

    test('should redirect to cannot use service page if there is no asked waste receiver', async () => {
      let actualUrl

      const notWasteRecievers = [fakeOrg({ isWasteReceiver: false })]
      const userId = faker.string.uuid()

      const request = {
        auth: {
          isAuthenticated: true,
          credentials: { id: userId }
        },
        backendApi: backendApi(notWasteRecievers)
      }

      const nextHandler = {
        redirect: (url) => (actualUrl = url),
        view: (_path, _options) => {}
      }

      await onboardingGetController.handler(request, nextHandler)

      expect(actualUrl).toBe(paths.cannotUseService)
    })

    test('should show error page if no organisations are found', async () => {
      let actualPath
      let actualOptions

      const userId = faker.string.uuid()

      const request = {
        auth: {
          isAuthenticated: true,
          credentials: { id: userId }
        },
        backendApi: backendApi([])
      }

      const nextHandler = {
        redirect: (_url) => {},
        view: (path, options) => {
          actualPath = path
          actualOptions = options
        }
      }

      await onboardingGetController.handler(request, nextHandler)

      expect(actualPath).toBe('isWasteReceiver/index')
      expect(actualOptions).toEqual({
        pageTitle: 'TODO ???????????????',
        question: `TODO ??????????????`,
        action: paths.isWasteReceiver,
        errors: null
      })
    })
  })

  describe('isWasteReceiverGetController', () => {
    test('should render page if organisationId is found', async () => {
      let actualPath
      let actualOptions

      const wasteRecievers = [fakeOrg({ isWasteReceiver: true })]
      const notWasteRecievers = [fakeOrg({ isWasteReceiver: false })]
      const unknownOrgs = [fakeOrg({ isWasteReceiver: null })]
      const userId = faker.string.uuid()

      const request = {
        auth: {
          isAuthenticated: true,
          credentials: { id: userId }
        },
        params: {
          organisationId: unknownOrgs[0].organisationId
        },
        backendApi: backendApi([
          ...wasteRecievers,
          ...notWasteRecievers,
          ...unknownOrgs
        ])
      }

      const nextHandler = {
        view: (path, options) => {
          actualPath = path
          actualOptions = options
        }
      }

      await isWasteReceiverGetController.handler(request, nextHandler)

      expect(actualPath).toBe('onboarding/isWasteReceiver')
      expect(actualOptions).toEqual({
        pageTitle: 'Report receipt of waste',
        question: `Is ${unknownOrgs[0].name} a waste receiver?`,
        organisationId: unknownOrgs[0].organisationId,
        action: paths.isWasteReceiver,
        errors: null
      })
    })
  })

  test('should return not found if no organisations found', async () => {
    const notWasteRecievers = [fakeOrg({ isWasteReceiver: false })]
    const userId = faker.string.uuid()

    const request = {
      auth: {
        isAuthenticated: true,
        credentials: { id: userId }
      },
      params: {
        organisationId: 'noneOrganisationID'
      },
      backendApi: backendApi([...notWasteRecievers])
    }

    await expect(
      async () => await isWasteReceiverGetController.handler(request, null)
    ).rejects.toThrow(boom.notFound('Oranisation not found'))
  })
})

describe('waitForNewOrganisations', () => {
  test.skip.each([
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
        isDone: (r) => r !== null,
        waitTime,
        iteration,
        delay
      })

      expect(timesCalled).toBe(times)
      expect(result).toBe(response)
    }
  )
})
