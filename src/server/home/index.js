import { paths } from '../../config/paths.js'
import { homeController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const home = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.startPage,
      ...homeController
    }
  ]
}
