import { paths } from '../../config/paths.js'
import { signInController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const signIn = {
  plugin: {
    name: 'signIn',
    register(server) {
      server.route([
        {
          method: ['GET', 'POST'],
          path: paths.SIGNIN_DEFRA_ID_CALLBACK,
          options: {
            auth: 'defraId'
          },
          ...signInController('signIn.defraId')
        },
        {
          method: ['GET', 'POST'],
          path: paths.SIGNIN_ENTRA_ID_CALLBACK,
          options: {
            auth: 'entraId'
          },
          ...signInController('signIn.entraId')
        }
      ])
    }
  }
}
