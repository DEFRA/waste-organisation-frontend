import { paths } from '../../config/paths.js'
import { healthController } from './controller.js'

export const health = {
  plugin: {
    name: 'health',
    register(server) {
      for (const path of [paths.HEALTH, paths.CHROME_DEVTOOLS]) {
        server.route({
          method: 'GET',
          path,
          ...healthController
        })
      }
    }
  }
}
