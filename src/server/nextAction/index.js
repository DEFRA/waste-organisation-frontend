import { paths } from '../../config/paths.js'
import { nextActionController } from './controller.js'

export const nextAction = {
  plugin: {
    name: 'nextAction',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.nextAction,
          ...nextActionController
        }
      ])
    }
  }
}
