import { paths } from '../../config/paths.js'
import { signedOutController } from './controller.js'

export const signedOut = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.signedOut,
      ...signedOutController
    }
  ]
}
