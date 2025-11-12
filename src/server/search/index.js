import { paths } from '../../config/paths.js'
import { searchController } from './controller.js'

const CACHE_CONTROL_NO_STORE = {
  privacy: 'default',
  otherwise: 'no-store'
}

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const search = {
  plugin: {
    name: 'search',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.SEARCH,
          options: {
            auth: 'session',
            cache: CACHE_CONTROL_NO_STORE
          },
          ...searchController
        }
      ])
    }
  }
}
