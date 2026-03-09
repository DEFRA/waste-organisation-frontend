import { paths } from '../../config/paths.js'
import { cookiesController } from './controller.js'

export const cookies = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.cookies,
      ...cookiesController
    }
  ]
}
