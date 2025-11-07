import { paths } from '../../config/paths.js'
import { setUserSession } from '../common/helpers/auth/user-session.js'

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const signInCallbackController = {
  async handler(request, h) {
    const sessionId = crypto.randomUUID()
    await setUserSession(request, sessionId)
    request.cookieAuth.set({ sessionId })

    return h.redirect(paths.SEARCH)
  }
}
