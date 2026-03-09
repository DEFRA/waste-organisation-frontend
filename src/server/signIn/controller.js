import { randomUUID } from 'node:crypto'

import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { setUserSession } from '../common/helpers/auth/user-session.js'
import { metricsCounter } from '../common/helpers/metrics.js'

export const signInController = (metricName) => ({
  async handler(request, h) {
    const sessionId = randomUUID()
    await setUserSession(request, sessionId)
    request.cookieAuth.set({ sessionId })

    metricsCounter(metricName)

    const redirectPath = config.get('featureFlags.accountPage')
      ? paths.account
      : paths.nextAction
    return h.redirect(redirectPath)
  }
})
