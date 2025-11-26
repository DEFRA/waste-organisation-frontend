import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#isWasteReceiverController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should render question', async () => {
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
    expect(result).toEqual(expect.stringContaining('a waste receiver?'))
  })

  test.each([
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

  test.each(['yes', 'no'])('Save company details', async (isWasteReceiver) => {
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
    expect(headers.location).toBe('/TODO-next-page')
  })
})
