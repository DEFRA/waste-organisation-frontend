import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { renderOrganisationRequired } from '../common/helpers/auth/organisation-check.js'

export const error500Controller = {
  handler() {
    if (!config.get('featureFlags.testErrors')) {
      throw boom.notFound()
    }

    throw boom.internal('Test 500 error')
  }
}

export const organisationRequiredController = {
  handler(request, h) {
    if (!config.get('featureFlags.testErrors')) {
      throw boom.notFound()
    }

    return renderOrganisationRequired(request, h)
  }
}
