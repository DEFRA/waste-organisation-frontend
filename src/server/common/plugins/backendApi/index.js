import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'
import { createLogger } from '../../helpers/logging/logger.js'

const logger = createLogger()

const logErr = async (f) => {
  try {
    return await f()
  } catch (e) {
    logger.error('ERROR calling backend api', e)
    return null
  }
}

const apiCall = (asyncFunc, url, payload) => {
  return async () => {
    const r = { json: 'strict' }
    if (payload) r.payload = payload
    const response = await asyncFunc(url, r)
    return response.payload
  }
}

const remoteCall = (backendUrl, _presharedKey) => {
  return {
    getOrganisations: async (userId) => {
      const { organisations } = await logErr(
        apiCall(wreck.get, `${backendUrl}/user/${userId}/organisations`)
      )
      return organisations
    },
    saveOrganisation: async (userId, organisationId, orgData) => {
      const { organisation } = await logErr(
        apiCall(
          wreck.put,
          `${backendUrl}/user/${userId}/organisation/${organisationId}`,
          {
            organisation: orgData
          }
        )
      )
      return organisation
    },
    saveSpreadsheet: async (organisationId, uploadId, statusUrl) => {
      return await logErr(
        apiCall(
          wreck.put,
          `${backendUrl}/spreadsheet/${organisationId}/${uploadId}`,
          {
            spreadsheet: { statusUrl }
          }
        )
      )
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
