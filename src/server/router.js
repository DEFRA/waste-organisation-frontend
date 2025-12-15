import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { health } from './health/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { search } from './search/index.js'
import { signIn } from './signIn/index.js'
import { addWasteReceiver } from './addWasteReceiver/index.js'
import { noWasteReceiver } from './noWasteReceiver/index.js'
import { onboarding } from './onboarding/index.js'
import { dashboard } from './dashboard/index.js'
import { cannotUseService } from './cannotUseService/index.js'
import { isWasteReceiver } from './isWasteReceiver/index.js'

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
        home,
        about,
        dashboard,
        cannotUseService,
        search,
        onboarding,
        addWasteReceiver,
        noWasteReceiver,
        isWasteReceiver
      ])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
