import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { isWasteReceiverController } from './controller.js'

/**
 * Sets up the routes used in the isWasteReceiver page.
 * These routes are registered in src/server/router.js.
 */
export const isWasteReceiver = {
  plugin: {
    name: 'isWasteReceiver',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.isWasteReceiver,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...isWasteReceiverController
        }
      ])
    }
  }
}
