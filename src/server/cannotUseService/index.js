import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { cannotUseServiceController } from './controller.js'

export const cannotUseService = {
  plugin: {
    name: 'cannotUseService',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.cannotUseService,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...cannotUseServiceController
        }
      ])
    }
  }
}
