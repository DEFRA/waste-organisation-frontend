import wreck from '@hapi/wreck'
import { config } from '../../../../config/config.js'

const remoteCall = (_url, _presharedKey) => ({
  getOrganisations: async (userId) => {
    console.log('calling api >>>>>>>>>>>>>>>>>>>>>>>>>')

    const backendUrl = config.get('backendApi.url')

    try {
      const { payload } = await wreck.get(
        `${backendUrl}/user/${userId}/organisations`,
        {
          json: 'strict'
        }
      )
      console.log('payload >>>>>>>>>>>>>>>>>>>>>', payload)
      return payload.organisations
    } catch (e) {
      console.log('ERROR calling api >>>>>>>>>>>>>>>>>>>>>>>>>', e)
      return null
    }
  },
  saveOrganisation: async (userId, organisationId, data) => {
    console.log('Saving org >>> ', userId, organisationId, data)
    return { ...data, organisationId, userId }
  }
})

export const backendApi = {
  plugin: {
    name: 'backendApi',
    register: async (server) => {
      const { url, presharedKey } = config.get('backendApi')
      server.decorate('request', 'backendApi', remoteCall(url, presharedKey))
    }
  }
}
