import { paths } from '../../config/paths.js'
import { accountController } from './controller.js'

export const account = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.account,
      ...accountController
    }
  ]
}
