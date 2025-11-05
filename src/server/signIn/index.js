import { paths } from '../../config/paths.js'
import { signInController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const signIn = {
  plugin: {
    name: 'signin',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.SIGN_IN,
          options: {
            auth: 'defraId'
          },
          ...signInController
        },
        {
          method: 'GET',
          path: paths.SIGN_IN_ENTRA,
          options: {
            auth: 'entraId'
          },
          ...signInController
        }
      ])
    }
  }
}
