import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { removeUserSession } from '../common/helpers/auth/user-session.js'
import { metricsCounter } from '../common/helpers/metrics.js'

export const signOutController = {
  async handler(request, h) {
    const session = request.auth.credentials

    const appBaseUrl = config.get('appBaseUrl')
    const postLogoutRedirectUri = `${appBaseUrl}${paths.signedOut}`
    const logoutUrl = `${session.logoutUrl}?post_logout_redirect_uri=${postLogoutRedirectUri}`

    removeUserSession(request)

    await metricsCounter('signOut.success')

    const pageContent = content.signOut(request)

    return h.view('signOut/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      fallbackLink: pageContent.fallbackLink,
      logoutUrl
    })
  }
}
