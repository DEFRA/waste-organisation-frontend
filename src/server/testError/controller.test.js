import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'

const originalFlag = config.get('featureFlags.testErrors')

describe('#testError', () => {
  let server

  beforeAll(async () => {
    config.set('featureFlags.testErrors', true)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.testErrors', originalFlag)
    await server.stop({ timeout: 0 })
  })

  test('GET /test-error/500 returns 500 error page', async () => {
    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: paths.testError500
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
    expect(result).toEqual(
      expect.stringContaining('Sorry, there is a problem with the service')
    )
  })

  test('GET /test-error/organisation-required returns 403 organisation-required page', async () => {
    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: paths.testErrorOrganisationRequired
    })

    expect(statusCode).toBe(statusCodes.forbidden)
    expect(result).toEqual(
      expect.stringContaining('You cannot continue on this service')
    )
  })
})

describe('#testError - disabled', () => {
  let server

  beforeAll(async () => {
    config.set('featureFlags.testErrors', false)
    server = await initialiseServer()
  })

  afterAll(async () => {
    config.set('featureFlags.testErrors', originalFlag)
    await server.stop({ timeout: 0 })
  })

  test('GET /test-error/500 returns 404 when feature flag is off', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.testError500
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET /test-error/organisation-required returns 404 when feature flag is off', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.testErrorOrganisationRequired
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
