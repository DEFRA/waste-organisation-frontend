import { config } from '../../../../config/config.js'

const remoteCall = (url, presharedKey) => ({
  getOrganisations: async (userId) => {
    return [
      { name: 'Joe Bloggs LTD', id: '8e4f7ffb-1936-4ca5-8f82-5be929e0de1b' }
    ]
  },
  saveOrganisation: async (organisationId, data) => {
    console.log('Saving org >>> ', organisationId, data)
    return { ...data, organisationId }
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
