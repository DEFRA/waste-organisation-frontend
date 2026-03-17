import boom from '@hapi/boom'

import { config } from '../../config/config.js'

export const error500Controller = {
  handler() {
    if (!config.get('featureFlags.testErrors')) {
      throw boom.notFound()
    }

    throw boom.internal('Test 500 error')
  }
}
