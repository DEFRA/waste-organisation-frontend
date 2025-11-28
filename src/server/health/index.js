import { paths } from '../../config/paths.js'
import { healthController } from './controller.js'

export const health = {
  plugin: {
    name: 'health',
    register(server) {
      for (const path of [paths.health, paths.chromeDevtools]) {
        server.route({
          method: 'GET',
          path,
          ...healthController
        })
      }
    }
  }
}
