import inert from '@hapi/inert'

import { cacheControlNoStore } from '../config/config.js'
import { home } from './home/index.js'
import { about } from './about/index.js'
import { cookies } from './cookies/index.js'
import { terms } from './terms/index.js'
import { privacy } from './privacy/index.js'
import { health } from './health/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { search } from './search/index.js'
import { signIn } from './signIn/index.js'
import { onboarding } from './onboarding/index.js'
import { dashboard } from './dashboard/index.js'
import { nextAction } from './nextAction/index.js'
import { spreadsheet } from './spreadsheet/index.js'
import { apiManagement } from './apiManagement/index.js'
import { downloadSpreadsheet } from './downloadSpreadsheet/index.js'
import { updateSpreadsheet } from './updateSpreadsheet/index.js'
import { account } from './account/index.js'
import { newAccount } from './newAccount/index.js'
import { serviceCharge } from './serviceCharge/index.js'
import { reviewPayment } from './serviceCharge/reviewPayment/index.js'
import { initiatePayment } from './serviceCharge/initiatePayment/index.js'
import { paymentDetails } from './serviceCharge/paymentDetails/index.js'
import { signOut } from './signOut/index.js'
import { signedOut } from './signedOut/index.js'
import { testError } from './testError/index.js'
import { organisationCheck } from './common/helpers/auth/organisation-check.js'

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
      pre: [{ method: organisationCheck }]
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
        home:           home.openRoutes,
        about:          about.openRoutes,
        cookies:        cookies.openRoutes,
        terms:          terms.openRoutes,
        privacy:        privacy.openRoutes,
        signIn:         signIn.routes,
        health:         health.openRoutes, // Used by platform to check if service is running, do not remove!
        onboarding:     onboarding.openRoutes,
        signedOut:      signedOut.openRoutes,
        testError:      testError.openRoutes,
        // Routes that require auth
        search:         search.authedRoutes.map((a) => addAuthWithOrg(a)),
        spreadsheet:    spreadsheet.authedRoutes.map((a) => addAuthWithOrg(a)).concat(spreadsheet.openRoutes),
        updateSpreadsheet: updateSpreadsheet.authedRoutes.map((a) => addAuthWithOrg(a)).concat(updateSpreadsheet.openRoutes),
        dashboard:      dashboard.authedRoutes.map((a) => addAuthWithOrg(a)),
        nextAction:     nextAction.authedRoutes.map((a) => addAuthWithOrg(a)),
        apiManagement:  apiManagement.authedRoutes.map((a) => addAuthWithOrg(a)),
        account:        account.authedRoutes.map((a) => addAuthWithOrg(a)),
        newAccount:     newAccount.authedRoutes.map((a) => addAuthWithOrg(a)),
        serviceCharge:  serviceCharge.authedRoutes.map((a) => addAuthWithOrg(a)),
        reviewPayment:  reviewPayment.authedRoutes.map((a) => addAuthWithOrg(a)),
        initiatePayment: initiatePayment.authedRoutes.map((a) => addAuthWithOrg(a)),
        paymentDetails: paymentDetails.authedRoutes.map((a) => addAuthWithOrg(a)),
        signOut:        signOut.authedRoutes.map((a) => addAuth(a)),
        downloadSpreadsheet: downloadSpreadsheet.authedRoutes.map((a) => addAuthWithOrg(a)),
      }).reduce((p, entry) => createPlugin(p, entry), [])

      // Application specific routes, add your own routes here
      await server.register(plugins)

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
