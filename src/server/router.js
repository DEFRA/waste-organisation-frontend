import inert from '@hapi/inert'

import { cacheControlNoStore } from '../config/config.js'
import { cookies } from './compliance/cookies/index.js'
import { terms } from './compliance/terms/index.js'
import { privacy } from './compliance/privacy/index.js'
import { accessibilityStatement } from './compliance/accessibilityStatement/index.js'
import { health } from './health/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { search } from './search/index.js'
import { onboarding } from './onboarding/index.js'
import { spreadsheet } from './spreadsheet/index.js'
import { apiManagement } from './apiManagement/index.js'
import { serviceCharge } from './serviceCharge/index.js'

import { organisationCheck } from './common/helpers/auth/organisation-check.js'
import { paymentCheck } from './common/helpers/auth/payment-check.js'
import { account } from './account/index.js'
import { authentication } from './authentication/index.js'

const createPlugin = (plugins, [item, routes]) => {
  plugins.push({
    plugin: {
      name: item,
      register(server) {
        server.route(routes)
      }
    }
  })
  return plugins
}

const addAuth = (route) => ({
  ...route,
  options: {
    ...route.options,
    auth: 'session',
    cache: cacheControlNoStore
  }
})

const addAuthWithOrg = (route) => {
  const authedRoute = addAuth(route)
  return {
    ...authedRoute,
    options: {
      ...authedRoute.options,
      pre: [{ method: organisationCheck }, ...(authedRoute.options.pre ?? [])]
    }
  }
}

const addAuthWithOrgPayment = (route) => {
  const authedRoute = addAuth(route)
  return {
    ...authedRoute,
    options: {
      ...authedRoute.options,
      pre: [
        { method: organisationCheck },
        { method: paymentCheck },
        ...(authedRoute.options.pre ?? [])
      ]
    }
  }
}

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // prettier-ignore
      const plugins = Object.entries({
        // Open routes
        cookies:                 cookies.openRoutes,
        terms:                   terms.openRoutes,
        privacy:                 privacy.openRoutes,
        accessibilityStatement:  accessibilityStatement.openRoutes,
        health:                  health.openRoutes, // Used by platform to check if service is running, do not remove!
        onboarding:              onboarding.openRoutes,
        authentication:          authentication.openRoutes,
        serviceChargeCallback:   serviceCharge.openRoutes,
        search:                  search.openRoutes,
        // Routes that require auth
        spreadsheet:             spreadsheet.authedRoutes.map((a) => addAuthWithOrgPayment(a)).concat(spreadsheet.downloadRoutes.map((a) => addAuthWithOrg(a))).concat(spreadsheet.openRoutes),
        apiManagement:           apiManagement.authedRoutes.map((a) => addAuthWithOrgPayment(a)),
        account:                 account.authedRoutes.map((a) => addAuthWithOrg(a)),
        serviceCharge:           serviceCharge.authedRoutes.map((a) => addAuthWithOrg(a))
      }).reduce((p, entry) => createPlugin(p, entry), [])

      // Application specific routes, add your own routes here
      await server.register(plugins)

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
