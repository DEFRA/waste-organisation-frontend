import yar from '@hapi/yar'

import { config } from '../../../../config/config.js'

const sessionConfig = config.get('session')
const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

/**
 * Set options.maxCookieSize to 0 to always use server-side storage
 */
export const sessionCache = {
  plugin: yar,
  options: {
    name: sessionConfig.cache.name,
    cache: {
      cache: sessionConfig.cache.name,
      expiresIn: sessionConfig.cache.ttl
    },
    storeBlank: false,
    errorOnCacheNotReady: true,
    cookieOptions: {
      password: sessionConfig.cookie.password,
      ttl: sessionConfig.cookie.ttl,
      ...(isServiceChargeEnabled && {
        isSameSite: sessionConfig.cookie.sameSite
      }),
      isSecure: config.get('session.cookie.secure'),
      clearInvalid: true
    }
  }
}
