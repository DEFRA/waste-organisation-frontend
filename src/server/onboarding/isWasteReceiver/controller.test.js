import { faker } from '@faker-js/faker'
import boom from '@hapi/boom'
import { paths } from '../../../config/paths.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { isWasteReceiverGetController } from './controller.js'
import { setupAuthedUserSession } from '../../../test-utils/session-helper.js'
import { statusCodes } from '../../common/constants/status-codes.js'

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

describe('#isWasteReciverController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET', () => {
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

      expect(actualPath).toBe('onboarding/isWasteReceiver/index')
      expect(actualOptions).toEqual({
        pageTitle: 'Report receipt of waste',
        question: `Is ${unknownOrgs[0].name} a waste receiver?`,
        organisationId: unknownOrgs[0].organisationId,
        action: paths.isWasteReceiver,
        errors: null
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

  describe('POST', () => {
    test('Should redirect to add-waste-receiver when request is valid', async () => {
      const credentials = await setupAuthedUserSession(server)

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: paths.isWasteReceiver,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          organisationId: faker.string.uuid(),
          isWasteReceiver: faker.datatype.boolean() ? 'yes' : 'no'
        }
      })

      expect(headers.location).toEqual('/add-waste-receiver')
      expect(statusCode).toBe(statusCodes.found)
    })

    test('Should error if request is not valid', async () => {
      const credentials = await setupAuthedUserSession(server)

      const data = await server.inject({
        method: 'POST',
        url: paths.isWasteReceiver,
        auth: {
          strategy: 'session',
          credentials
        },
        payload: {
          organisationId: faker.string.uuid(),
          isWasteReceiver: 'yes'
        }
      })

      console.log(data)

      // expect(headers.location).toEqual('/add-waste-receiver')
      // expect(statusCode).toBe(statusCodes.found)
    })
  })
})
