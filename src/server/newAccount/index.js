import { paths } from '../../config/paths.js'
import { newAccountController } from './controller.js'

export const newAccount = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.newAccount,
      ...newAccountController
    }
  ]
}
