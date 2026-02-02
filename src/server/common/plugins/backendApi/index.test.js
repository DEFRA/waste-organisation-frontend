import { beforeEach, describe, expect, vi } from 'vitest'
import hapi from '@hapi/hapi'
import { backendApi } from './index.js'
import wreck from '@hapi/wreck'

describe('backendApi', () => {
  let backendApiService
  let server

  beforeEach(async () => {
    server = hapi.server({})

    await server.register([backendApi])

    server.route({
      method: 'GET',
      path: '/',
      handler: async (request) => {
        backendApiService = await request.backendApi

        return null
      }
    })
    await server.initialize()

    await server.inject({
      method: 'GET',
      url: '/'
    })
  })

  test('getOrganisations get correct data', async () => {
    const expectedOrganisation = [
      { name: 'Monkey Barrel LTD', id: '9c6a06d7-e691-4740-89a2-a64d23478034' }
    ]

    vi.spyOn(wreck, 'get').mockImplementation(async () => {
      return {
        payload: {
          organisations: expectedOrganisation
        }
      }
    })

    const actualOrganisations =
      await backendApiService.getOrganisations('userId')

    expect(actualOrganisations).toEqual(expectedOrganisation)
  })

  test('getOrganisations get correct data', async () => {
    const expectedResponse = {
      randomData: 'Some Data',
      organisationId: 'organisationId',
      userId: 'userId'
    }

    vi.spyOn(wreck, 'put').mockImplementation(async () => ({
      payload: {
        organisation: expectedResponse
      }
    }))

    const actualResponse = await backendApiService.saveOrganisation(
      'userId',
      'organisationId',
      { randomData: 'Some Data' }
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  test('saveSpreadsheet dummy test for coverage reasons', async () => {
    const expectedResponse = {
      randomData: 'Some Data'
    }

    vi.spyOn(wreck, 'put').mockImplementation(async () => ({
      payload: { spreadsheet: expectedResponse }
    }))

    const actualResponse = await backendApiService.saveSpreadsheet(
      'organisationId',
      'uploadId',
      expectedResponse
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  test('getApiCodes get correct data', async () => {
    const expectedApiCodes = [
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 1',
        isDisabled: false
      }
    ]

    vi.spyOn(wreck, 'get').mockImplementation(async () => {
      return {
        payload: {
          apiCodes: expectedApiCodes
        }
      }
    })

    const actualApiCodes = await backendApiService.getApiCodes('organisationId')

    expect(actualApiCodes).toEqual(expectedApiCodes)
  })

  test('createApiCodes should send data to create code', async () => {
    const expectedResponse = {
      code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
      name: 'API Code 1',
      isDisabled: false
    }

    vi.spyOn(wreck, 'post').mockImplementation(async () => ({
      payload: expectedResponse
    }))

    const actualResponse = await backendApiService.createApiCodes(
      'organisationId',
      {}
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  describe('Handle Exceptions', () => {
    test('getOrganisations Should handle Errors', async () => {
      vi.spyOn(wreck, 'get').mockImplementation(async () => {
        throw new Error()
      })

      const actualResponse = await backendApiService.getOrganisations('userId')

      expect(actualResponse).toBeUndefined()
    })

    test('saveOrganisation Should handle Errors', async () => {
      vi.spyOn(wreck, 'put').mockImplementation(async () => {
        throw new Error()
      })

      const actualResponse = await backendApiService.saveOrganisation('userId')

      expect(actualResponse).toBeUndefined()
    })

    test('saveSpreadsheet Should handle Errors', async () => {
      vi.spyOn(wreck, 'put').mockImplementation(async () => {
        throw new Error()
      })

      const actualResponse = await backendApiService.saveSpreadsheet('userId')

      expect(actualResponse).toBeUndefined()
    })

    test('getApiCodes Should handle Errors', async () => {
      vi.spyOn(wreck, 'get').mockImplementation(async () => {
        throw new Error()
      })

      const actualResponse = await backendApiService.getApiCodes('userId')

      expect(actualResponse).toBeUndefined()
    })

    test('createApiCodes Should handle Errors', async () => {
      vi.spyOn(wreck, 'post').mockImplementation(async () => {
        throw new Error()
      })

      const actualResponse = await backendApiService.createApiCodes('userId')

      expect(actualResponse).toBeNull()
    })
  })
})
