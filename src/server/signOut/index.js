import { cacheControlNoStore } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { signOutController } from './controller.js'

export const signOut = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.signOut,
      options: {
        cache: cacheControlNoStore
      },
      ...signOutController
    }
  ]
}
