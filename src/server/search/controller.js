import boom from '@hapi/boom'

import { config } from '../../config/config.js'

export const searchController = {
  handler(request, h) {
    if (!config.get('featureFlags.searchPage')) {
      throw boom.notFound()
    }

    request.contentSecurityPolicy = {
      extraAuthOrigins: request.auth.credentials.providerEndpoints
    }
    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'You are logged in',
      credentials: JSON.stringify(request.auth.credentials, null, 2)
    })
  }
}
