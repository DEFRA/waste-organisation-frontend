import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { dashboardController } from './controller.js'

export const dashboard = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.dashboard,
      options: {
        auth: 'session',
        cache: cacheControlNoStore
      },
      ...dashboardController
    }
  ]
}
