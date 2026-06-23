import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'
import { createLogger } from '../../helpers/logging/logger.js'
import { withTraceId } from '@defra/hapi-tracing'

const logger = createLogger()

const apiCall = async (asyncFunc, preSharedKey, url, payload) => {
  try {
    const tracingHeader = config.get('tracing.header')

    const r = {
      json: 'strict',
      headers: withTraceId(tracingHeader, {
        'x-auth-token': preSharedKey
      })
    }
    if (payload) {
      r.payload = payload
    }
    const response = await asyncFunc(url, r)

    logger.debug(`request data: ${Object.keys(r.headers)}`)

    if (r.headers[tracingHeader]) {
      logger.debug(`request data - header: ${r.headers[tracingHeader]}`)
    } else {
      logger.debug(`request data - header: No tracingHeader set`)
    }

    return response.payload
  } catch (e) {
    logger.error(`ERROR calling backend api ${e}, ${url}, ${payload}`)
    return null
  }
}

const organisationCall = (backendUrl, presharedKey) => ({
  getOrganisation: async (userId, organisationId) => {
    const response = await apiCall(
      (url, r) => wreck.get(url, r),
      presharedKey,
      `${backendUrl}/user/${userId}/organisation/${organisationId}`
    )
    return response?.organisation
  },
  saveOrganisation: async (userId, organisationId, orgData) => {
    const response = await apiCall(
      (url, r) => wreck.put(url, r),
      presharedKey,
      `${backendUrl}/user/${userId}/organisation/${organisationId}`,
      {
        organisation: orgData
      }
    )
    return response?.organisation
  }
})

const spreadsheetCall = (backendUrl, presharedKey) => ({
  saveSpreadsheet: async (organisationId, uploadId, s) => {
    const response = await apiCall(
      (url, r) => wreck.put(url, r),
      presharedKey,
      `${backendUrl}/spreadsheet/${organisationId}/${uploadId}`,
      { spreadsheet: s }
    )
    return response?.spreadsheet
  }
})

const apiCodeCall = (backendUrl, presharedKey) => ({
  getApiCodes: async (organisationId) => {
    const apiCodes = await apiCall(
      (url, r) => wreck.get(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/apiCodes`
    )

    return apiCodes?.apiCodes
  },
  createApiCodes: async (organisationId, apiCodeData) => {
    const apiCode = await apiCall(
      (url, r) => wreck.post(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/apiCodes`,
      apiCodeData
    )
    return apiCode
  },
  updateApiCodes: async (organisationId, code, apiCodeData) => {
    const apiCode = await apiCall(
      (url, r) => wreck.put(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/apiCodes/${code}`,
      { apiCode: apiCodeData }
    )
    return apiCode
  }
})

const paymentCall = (backendUrl, presharedKey) => ({
  initiatePayment: async (organisationId, paymentData) => {
    const payment = await apiCall(
      (url, r) => wreck.post(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/initiatePayment/`,
      { payment: paymentData }
    )
    return payment
  },
  savePayment: async (organisationId, payment) => {
    console.log(' -- >>>', organisationId, payment)
    const paymentResponse = await apiCall(
      (url, r) => wreck.put(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/payment/${payment.payment_id}`,
      { payment }
    )
    return paymentResponse
  },
  paymentStatus: async (organisationId, paymentId) => {
    const paymentResponse = await apiCall(
      (url, r) => wreck.post(url, r),
      presharedKey,
      `${backendUrl}/organisation/${organisationId}/payment/${paymentId}`
    )
    return paymentResponse
  }
})

export const backendApi = {
  plugin: {
    name: 'backendApi',
    register: async (server) => {
      const { url, presharedKey } = config.get('backendApi')
      server.decorate('request', 'backendApi', {
        ...organisationCall(url.replace(/\/$/, ''), presharedKey),
        ...spreadsheetCall(url.replace(/\/$/, ''), presharedKey),
        ...apiCodeCall(url.replace(/\/$/, ''), presharedKey),
        ...paymentCall(url.replace(/\/$/, ''), presharedKey)
      })
    }
  }
}
