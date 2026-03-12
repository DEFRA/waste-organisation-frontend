import authCookie from '@hapi/cookie'

import { config } from '../../../../config/config.js'
import { validateUserSession } from '../../helpers/auth/user-session.js'

const sessionConfig = config.get('session')
const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

export const userSession = {
  plugin: {
    name: 'user-session',
    register: async (server) => {
      await server.register(authCookie)
      server.auth.strategy('session', 'cookie', {
        cookie: {
          name: 'userSession',
          path: '/',
          password: sessionConfig.cookie.password,
          ...(isServiceChargeEnabled && {
            isSameSite: sessionConfig.cookie.sameSite
          }),
          isSecure: sessionConfig.cookie.secure,
          ttl: sessionConfig.cookie.ttl
        },
        keepAlive: true,
        validate: async (request, session) => {
          return await validateUserSession(server, request, session)
        }
      })

      server.auth.default('session')
    }
  }
}
