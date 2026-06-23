import { beforeEach, describe, expect, vi } from 'vitest'
import hapi from '@hapi/hapi'
import { backendApi } from './index.js'
import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'
const backendConfig = config.get('backendApi')

describe('backendApi', () => {
  let backendApiService
  let server
  let backendApiUrl
  let backendApiAuthCode

  beforeEach(async () => {
    server = hapi.server({})
    backendApiUrl = backendConfig.url
    backendApiAuthCode = backendConfig.presharedKey
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

  test('saveSpreadsheet dummy test for coverage reasons', async () => {
    const expectedResponse = {
      randomData: 'Some Data'
    }

    vi.spyOn(wreck, 'get').mockImplementation(async () => ({
      payload: { organisation: expectedResponse }
    }))

    const actualResponse = await backendApiService.getOrganisation(
      'userId',
      'organisationId'
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

  test('updateApiCodes should send data to update code', async () => {
    const expectedResponse = {
      code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
      name: 'API Code 1',
      isDisabled: false
    }

    vi.spyOn(wreck, 'put').mockImplementation(async () => ({
      payload: expectedResponse
    }))

    const actualResponse = await backendApiService.updateApiCodes(
      'organisationId',
      'apiCode',
      {}
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  test('createPayment should send data to create payment', async () => {
    const expectedResponse = {
      nextUrl: ''
    }

    const mockPost = vi.spyOn(wreck, 'post')
    mockPost.mockImplementation(async () => ({
      payload: expectedResponse
    }))

    const paymentPayload = { amount: 1 }

    await backendApiService.initiatePayment('organisationId', paymentPayload)

    expect(mockPost).toBeCalledWith(
      `${backendApiUrl}/organisation/organisationId/initiatePayment/`,
      {
        headers: {
          'x-auth-token': backendApiAuthCode
        },
        json: 'strict',
        payload: {
          payment: paymentPayload
        }
      }
    )
  })

  test('savePayment should send data to save payment', async () => {
    const expectedResponse = {
      payment_id: 'payment123',
      status: 'success'
    }

    vi.spyOn(wreck, 'put').mockImplementation(async () => ({
      payload: expectedResponse
    }))

    const actualResponse = await backendApiService.savePayment(
      'organisationId',
      { payment_id: 'payment123' }
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  test('paymentStatus should send data to get payment status', async () => {
    const expectedResponse = {
      payment_id: 'payment123',
      status: 'success'
    }

    vi.spyOn(wreck, 'post').mockImplementation(async () => ({
      payload: expectedResponse
    }))

    const actualResponse = await backendApiService.paymentStatus(
      'organisationId',
      'payment123'
    )

    expect(actualResponse).toEqual(expectedResponse)
  })

  describe('Handle Exceptions', () => {
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

    test('savePayment Should handle Errors', async () => {
      vi.spyOn(wreck, 'put').mockImplementation(async () => {
        throw new Error()
      })
      const actualResponse = await backendApiService.savePayment('orgId', {})
      expect(actualResponse).toBeNull()
    })

    test('paymentStatus Should handle Errors', async () => {
      vi.spyOn(wreck, 'post').mockImplementation(async () => {
        throw new Error()
      })
      const actualResponse = await backendApiService.paymentStatus(
        'orgId',
        'paymentId'
      )
      expect(actualResponse).toBeNull()
    })
  })
})
