import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { noWasteReceiverController } from './controller.js'

export const noWasteReceiver = {
  plugin: {
    name: 'noWasteReceiver',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.noWasteReceiver,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...noWasteReceiverController
        }
      ])
    }
  }
}
