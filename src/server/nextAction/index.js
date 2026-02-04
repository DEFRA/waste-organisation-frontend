import { paths } from '../../config/paths.js'
import { nextActionController } from './controller.js'

export const nextAction = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.nextAction,
      ...nextActionController
    }
  ]
}
