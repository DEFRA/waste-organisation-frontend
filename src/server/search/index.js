import { paths } from '../../config/paths.js'
import { searchController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const search = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.search,
      ...searchController
    }
  ]
}
