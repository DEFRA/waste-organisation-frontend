import Boom from '@hapi/boom'

import { config } from '../../config/config.js'

export const error500Controller = {
  handler() {
    if (!config.get('featureFlags.testErrors')) {
      throw Boom.notFound()
    }

    throw Boom.internal('Test 500 error')
  }
}
