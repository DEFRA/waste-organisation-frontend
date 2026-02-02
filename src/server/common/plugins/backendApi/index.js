import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'
import { createLogger } from '../../helpers/logging/logger.js'

const logger = createLogger()

const apiCall = async (asyncFunc, preSharedKey, url, payload) => {
  try {
    const headers = { 'x-auth-token': preSharedKey }
    const r = { json: 'strict', headers }
    if (payload) {
      r.payload = payload
    }
    const response = await asyncFunc(url, r)
    return response.payload
  } catch (e) {
    logger.error(`ERROR calling backend api ${e}, ${url}, ${payload}`)
    return null
  }
}

const remoteCall = (backendUrl, presharedKey) => {
  return {
    getOrganisations: async (userId) => {
      const response = await apiCall(
        (url, r) => wreck.get(url, r),
        presharedKey,
        `${backendUrl}/user/${userId}/organisations`
      )
      return response?.organisations
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
    },
    saveSpreadsheet: async (organisationId, uploadId, s) => {
      const response = await apiCall(
        (url, r) => wreck.put(url, r),
        presharedKey,
        `${backendUrl}/spreadsheet/${organisationId}/${uploadId}`,
        { spreadsheet: s }
      )
      return response?.spreadsheet
    },
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
    }
  }
}

export const backendApi = {
  plugin: {
    name: 'backendApi',
    register: async (server) => {
      const { url, presharedKey } = config.get('backendApi')
      server.decorate('request', 'backendApi', remoteCall(url, presharedKey))
    }
  }
}
