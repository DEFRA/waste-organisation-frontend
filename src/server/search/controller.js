import boom from '@hapi/boom'

import { config } from '../../config/config.js'

const featureFlagEnvVars = {
  updateSpreadsheet: 'FEATURE_FLAG_UPDATE_SPREADSHEET',
  accountPage: 'FEATURE_FLAG_ACCOUNT_PAGE',
  searchPage: 'FEATURE_FLAG_SEARCH_PAGE',
  signOut: 'FEATURE_FLAG_SIGN_OUT',
  serviceCharge: 'FEATURE_FLAG_SERVICE_CHARGE'
}

export const searchController = {
  handler(request, h) {
    if (!config.get('featureFlags.searchPage')) {
      throw boom.notFound()
    }

    const flags = config.get('featureFlags')
    const featureFlags = Object.entries(flags).map(([name, enabled]) => ({
      name,
      envVar: featureFlagEnvVars[name],
      enabled
    }))

    request.contentSecurityPolicy = {
      extraAuthOrigins: request.auth.credentials.providerEndpoints
    }
    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'You are logged in',
      credentials: JSON.stringify(request.auth.credentials, null, 2),
      featureFlags
    })
  }
}
