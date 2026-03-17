import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'

describe('#searchController', () => {
  let server

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('when feature flag is enabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.searchPage', true)
      server = await initialiseServer()
    })

    afterEach(() => {
      config.set('featureFlags.searchPage', false)
    })

    test('Should provide expected response', async () => {
      const credentials = await setupAuthedUserSession(server)

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: paths.search,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(result).toEqual(expect.stringContaining('Search |'))
      expect(statusCode).toBe(statusCodes.ok)
    })

    test('Should display feature flags section', async () => {
      const credentials = await setupAuthedUserSession(server)

      const { result } = await server.inject({
        method: 'GET',
        url: paths.search,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(result).toEqual(expect.stringContaining('Feature flags'))
      expect(result).toEqual(expect.stringContaining('searchPage'))
      expect(result).toEqual(expect.stringContaining('updateSpreadsheet'))
      expect(result).toEqual(expect.stringContaining('accountPage'))
      expect(result).toEqual(expect.stringContaining('serviceCharge'))
      expect(result).toEqual(
        expect.stringContaining('FEATURE_FLAG_SEARCH_PAGE')
      )
      expect(result).toEqual(
        expect.stringContaining('FEATURE_FLAG_UPDATE_SPREADSHEET')
      )
      expect(result).toEqual(expect.stringContaining('Enabled'))
      expect(result).toEqual(expect.stringContaining('Disabled'))
    })

    test('Should return unauthorized when not authenticated', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.search
      })

      expect(statusCode).toBe(statusCodes.unauthorized)
    })
  })

  describe('when feature flag is disabled', () => {
    beforeEach(async () => {
      config.set('featureFlags.searchPage', false)
      server = await initialiseServer()
    })

    test('returns 404', async () => {
      const credentials = await setupAuthedUserSession(server)

      const { statusCode } = await server.inject({
        method: 'GET',
        url: paths.search,
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(statusCode).toBe(statusCodes.notFound)
    })
  })
})
