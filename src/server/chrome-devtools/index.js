import { paths } from '../../config/paths.js'
import { chromeDevtoolsController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const chromeDevTools = {
  plugin: {
    name: 'chromeDevtools',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.CHROME_DEVTOOLS,
          ...chromeDevtoolsController
        }
      ])
    }
  }
}
