import inert from '@hapi/inert'

import { cacheControlNoStore } from '../config/config.js'
import { home } from './home/index.js'
import { about } from './about/index.js'
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

const addAuth = (route) => {
  if (route.options == null) {
    route.options = {}
  }
  route.options.auth = 'session'
  route.options.cache = cacheControlNoStore
  return route
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
        signIn:         signIn.routes,
        health:         health.openRoutes, // Used by platform to check if service is running, do not remove!
        onboarding:     onboarding.openRoutes,
        // Routes that require auth
        search:         search.authedRoutes.map((a) => addAuth(a)),
        spreadsheet:    spreadsheet.authedRoutes.map((a) => addAuth(a)).concat(spreadsheet.openRoutes),
        dashboard:      dashboard.authedRoutes.map((a) => addAuth(a)),
        nextAction:     nextAction.authedRoutes.map((a) => addAuth(a)),
        apiManagement:  apiManagement.authedRoutes.map((a) => addAuth(a)),
        downloadSpreadsheet: downloadSpreadsheet.authedRoutes.map((a) => addAuth(a)),
      }).reduce((p, entry) => createPlugin(p, entry), [])

      // Application specific routes, add your own routes here
      await server.register(plugins)

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
