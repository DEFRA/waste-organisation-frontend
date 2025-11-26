import { openId } from './auth/open-id.js'
import { userSession } from './auth/session-cookie.js'
import { backendApi } from './backendApi/index.js'

export default [openId, userSession, backendApi]
