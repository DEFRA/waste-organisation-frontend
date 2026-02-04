import { paths } from '../../config/paths.js'
import { healthController } from './controller.js'

export const health = {
  openRoutes: [paths.health, paths.chromeDevtools].map((path) => ({
    method: 'GET',
    path,
    handler: healthController
  }))
}
