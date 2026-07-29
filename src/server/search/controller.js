import boom from '@hapi/boom'

import { config } from '../../config/config.js'

function getFeatureFlagTableRows() {
  const flags = config.get('featureFlags')
  const schema = config.getSchema()._cvtProperties.featureFlags._cvtProperties

  return Object.entries(flags).map(([name, enabled]) => {
    const tagClass = enabled ? '' : ' govuk-tag--grey'
    const statusHtml = `<strong class="govuk-tag${tagClass}">${enabled ? 'Enabled' : 'Disabled'}</strong>`

    return [{ text: name }, { text: schema[name]?.env }, { html: statusHtml }]
  })
}

export const searchController = {
  handler(request, h) {
    if (!config.get('featureFlags.searchPage')) {
      throw boom.notFound()
    }

    const featureFlagRows = getFeatureFlagTableRows()

    /* v8 ignore start - plugin data not provided by test harness */
    if (request?.auth?.credentials?.providerEndpoints) {
      request.contentSecurityPolicy = {
        extraAuthOrigins: request.auth.credentials.providerEndpoints
      }
    }
    /* v8 ignore stop */
    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'You are logged in',
      credentials: JSON.stringify(request?.auth?.credentials, null, 2),
      featureFlagRows
    })
  }
}
