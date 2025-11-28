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
      url: paths.noWasteReceiver,
      auth: {
        isAuthenticated: true,
        credentials: {},
        strategy: {}
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Sorry, you cannot use the service')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Based on your answers, you cannot use this service as you do not operate any businesses or organisations that receive waste.'
      )
    )
  })
})
