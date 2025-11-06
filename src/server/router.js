import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { health } from './health/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { search } from './search/index.js'
import { signIn } from './signIn/index.js'
import { chromeDevTools } from './chrome-devtools/index.js'
import { signInCallback } from './signInCallback/index.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([
        signIn,
        signInCallback,
        home,
        about,
        search,
        chromeDevTools
      ])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
