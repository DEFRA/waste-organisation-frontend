import { cacheControlNoStore } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { signInController } from './signIn/controller.js'
import { signedOutController } from './signedOut/controller.js'
import { signOutController } from './signOut/controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const authentication = {
  openRoutes: [
    {
      method: ['GET', 'POST'],
      path: paths.signinDefraIdCallback,
      options: {
        auth: 'defraId'
      },
      ...signInController('signIn.defraId')
    },
    {
      method: 'GET',
      path: paths.signOut,
      options: {
        cache: cacheControlNoStore
      },
      ...signOutController
    },
    {
      method: 'GET',
      path: paths.signedOut,
      ...signedOutController
    }
  ]
}
