import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#addWasteReceiverController', () => {
  let server

  beforeAll(async () => {
    const mockBackendApi = {
      plugin: {
        name: 'backendApi',
        register: async (server) => {
          server.decorate('request', 'backendApi', {
            getOrganisations: async (userId) => {
              return [
                {
                  name: 'Joe Blogs LTD',
                  id: '9c6a06d7-e691-4740-89a2-a64d23478034'
                }
              ]
            },
            saveOrganisation: async (userId, organisationId, data) => {
              return { ...data, organisationId, userId }
            }
          })
        }
      }
    }

    server = await initialiseServer({
      mockedPlugins: { backendApi: mockBackendApi }
    })
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should render question', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.addWasteReceiver,
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Would you like to add another waste receiver to your account?'
      )
    )
  })

  test.each([
    {},
    { payload: {} },
    { payload: { addWasteReceiver: null } },
    { payload: { addWasteReceiver: 'fish' } }
  ])('Should render error response', async (postData) => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.addWasteReceiver,
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      },
      ...postData
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('class="govuk-error-summary"')
    )
  })

  test('Selected not to add a new waste recever', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.addWasteReceiver,
      payload: { addWasteReceiver: 'no' },
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.search)
  })

  test('Save company details', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.addWasteReceiver,
      payload: { addWasteReceiver: 'yes' },
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.search)
  })
})
