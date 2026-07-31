import { randomUUID } from 'node:crypto'
import { paths } from '../../config/paths.js'
import { setUserSession } from '../common/helpers/auth/user-session.js'
import { metricsCounter } from '../common/helpers/metrics.js'

export const signInController = (metricName) => ({
  async handler(request, h) {
    const sessionId = randomUUID()
    await setUserSession(request, sessionId)
    request.cookieAuth.set({ sessionId })
    metricsCounter(metricName)

    if (request?.auth?.credentials?.profile.currentOrganisationId) {
      const {
        id,
        currentOrganisationId,
        currentOrganisationName,
        relationships
      } = request.auth.credentials.profile
      request.logger.info(
        `about to save org with id ${currentOrganisationId} "${currentOrganisationName}" - ${JSON.stringify(relationships)}`
      )
      const [isLocalAuthority] = request.yar.flash('isLocalAuthority')
      await request.backendApi.saveOrganisation(id, currentOrganisationId, {
        name: currentOrganisationName,
        ...(isLocalAuthority ? { isLocalAuthority } : {})
      })
    }
    return h.redirect(paths.account)
  }
})
