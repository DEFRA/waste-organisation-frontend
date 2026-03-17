import { paths } from '../../config/paths.js'
import { error500Controller } from './controller.js'

export const testError = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.testError500,
      ...error500Controller
    }
  ]
}
