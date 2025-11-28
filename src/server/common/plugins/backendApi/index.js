import { config } from '../../../../config/config.js'

const remoteCall = (_url, _presharedKey) => ({
  getOrganisations: async (_userId) => {
    return [
      { name: 'Monkey Barrel LTD', id: '9c6a06d7-e691-4740-89a2-a64d23478034' }
    ]
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
