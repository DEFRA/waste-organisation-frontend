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
    logger.error(
      `ERROR calling backend api ${JSON.stringify({ e, url, payload })}`
    )
    return null
  }
}

const remoteCall = (backendUrl, presharedKey) => {
  return {
    getOrganisations: async (userId) => {
      const { organisations } = await apiCall(
        (url, r) => wreck.get(url, r),
        presharedKey,
        `${backendUrl}/user/${userId}/organisations`
      )
      return organisations
    },
    saveOrganisation: async (userId, organisationId, orgData) => {
      const { organisation } = await apiCall(
        (url, r) => wreck.put(url, r),
        presharedKey,
        `${backendUrl}/user/${userId}/organisation/${organisationId}`,
        {
          organisation: orgData
        }
      )
      return organisation
    },
    saveSpreadsheet: async (organisationId, uploadId, s) => {
      const { spreadsheet } = await apiCall(
        (url, r) => wreck.put(url, r),
        presharedKey,
        `${backendUrl}/spreadsheet/${organisationId}/${uploadId}`,
        { spreadsheet: s }
      )
      return spreadsheet
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
