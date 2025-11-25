import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'
import { openIdProvider } from '../../helpers/auth/open-id-provider.js'

export const openId = {
  plugin: {
    name: 'open-id',
    register: async (server) => {
      const { defraId } = config.get('auth')
      const { cookie } = config.get('session')
      const baseUrl = config.get('appBaseUrl')

      const defra = await openIdProvider('defraId', defraId)
      server.auth.strategy('defraId', 'bell', {
        location: () => `${baseUrl}${paths.signinDefraIdCallback}`,
        provider: defra,
        password: cookie.password,
        clientId: defraId.clientId,
        clientSecret: defraId.clientSecret,
        isSecure: cookie.secure,
        providerParams: {
          serviceId: defraId.serviceId
        }
      })
    }
  }
}
