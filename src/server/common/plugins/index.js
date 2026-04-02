import { openId } from './auth/open-id.js'
import { userSession } from './auth/session-cookie.js'
import { backendApi } from './backendApi/index.js'
import { basicAuth } from './auth/basic.js'

export default {
  openId,
  userSession,
  backendApi,
  basicAuth
}
