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

const apiGet = (url, payload) => {
  return async () => {
    const r = { json: 'strict' }
    if (payload) r.payload = payload
    const response = await wreck.get(url, r)
    return response.payload
  }
}

const apiPut = (url, payload) => {
  return async () => {
    const r = { json: 'strict' }
    if (payload) r.payload = payload
    const response = await wreck.put(url, r)
    return response.payload
  }
}

const remoteCall = (backendUrl, _presharedKey) => {
  return {
    getOrganisations: async (userId) => {
      return await logErr(apiGet(`${backendUrl}/user/${userId}/organisations`))
    },
    saveOrganisation: async (userId, organisationId, orgData) => {
      return await logErr(
        apiPut(`${backendUrl}/user/${userId}/organisation/${organisationId}`, {
          organisation: orgData
        })
      )
    },
    saveSpreadsheet: async (organisationId, uploadId, statusUrl) => {
      return await logErr(
        apiPut(`${backendUrl}/spreadsheet/${organisationId}/${uploadId}`, {
          spreadsheet: { statusUrl }
        })
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
