import { paths } from '../../config/paths.js'
import { accountController } from './dashboard/controller.js'
import { newAccountController } from './newAccount/controller.js'
import { nextActionController } from './nextAction/controller.js'

export const account = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.account,
      ...accountController
    },
    {
      method: 'GET',
      path: paths.nextAction,
      ...nextActionController.get
    },
    {
      method: 'POST',
      path: paths.nextAction,
      ...nextActionController.post
    },
    {
      method: 'GET',
      path: paths.newAccount,
      ...newAccountController
    }
  ]
}
