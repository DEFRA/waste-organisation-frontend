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
})
