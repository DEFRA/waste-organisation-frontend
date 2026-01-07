import { randomUUID } from 'node:crypto'

import { paths } from '../../config/paths.js'
import { setUserSession } from '../common/helpers/auth/user-session.js'
import { metricsCounter } from '../common/helpers/metrics.js'

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const signInController = (metricName) => ({
  async handler(request, h) {
    const sessionId = randomUUID()
    await setUserSession(request, sessionId)
    request.cookieAuth.set({ sessionId })
    await storeOrganisation(
      request.backendApi,
      request.auth.credentials.profile
    )
    metricsCounter(metricName)
    return h.redirect(paths.onboarding)
  }
})

const storeOrganisation = async (backendApi, tokenData) => {
  if (!tokenData.relationships) {
    return
  }

  const relationships = tokenData.relationships
    .map((r) => r.split(':'))
    .map(([_relId, organisationId, name]) => ({
      organisationId,
      name
    }))
    .filter((r) => r.organisationId && r.name)

  const uniqueRelationships = Object.values(
    Object.groupBy(relationships, ({ organisationId }) => organisationId)
  )

  for (const [{ organisationId, name }] of uniqueRelationships) {
    await backendApi.saveOrganisation(tokenData.id, organisationId, {
      name
    })
  }
}
