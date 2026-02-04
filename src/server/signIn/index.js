import { paths } from '../../config/paths.js'
import { signInController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const signIn = {
  routes: [
    {
      method: ['GET', 'POST'],
      path: paths.signinDefraIdCallback,
      options: {
        auth: 'defraId'
      },
      ...signInController('signIn.defraId')
    }
  ]
}
