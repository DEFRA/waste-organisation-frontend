import { paths } from '../../config/paths.js'
import { signInCallbackController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const signInCallback = {
  plugin: {
    name: 'signinCallback',
    register(server) {
      server.route([
        {
          method: ['GET', 'POST'],
          path: paths.SIGNIN_DEFRA_ID_CALLBACK,
          options: {
            auth: 'defraId'
          },
          ...signInCallbackController
        },
        {
          method: ['GET', 'POST'],
          path: paths.SIGNIN_ENTRA_ID_CALLBACK,
          options: {
            auth: 'entraId'
          },
          ...signInCallbackController
        }
      ])
    }
  }
}
