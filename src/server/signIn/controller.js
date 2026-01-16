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

    metricsCounter(metricName)
    return h.redirect(paths.nextAction)
  }
})
