import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#isWasteReceiverController', () => {
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

  // TODO: Moveing to onboarding controller
  test.skip('Should render question', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.isWasteReceiver,
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Joe Blogs LTD a waste receiver?')
    )
  })

  // TODO: Moveing to onboarding controller
  test.skip.each([
    {},
    { payload: {} },
    { payload: { isWasteReceiver: null } },
    { payload: { isWasteReceiver: 'fish' } }
  ])('Should render error response', async (postData) => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.isWasteReceiver,
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

  // TODO: Moveing to onboarding controller
  test.skip.each(['yes', 'no'])(
    'Save company details',
    async (isWasteReceiver) => {
      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: paths.isWasteReceiver,
        payload: { isWasteReceiver },
        auth: {
          isAuthenticated: true,
          credentials: {},
          strategy: {}
        }
      })
      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(paths.addWasteReceiver)
    }
  )
})
