import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import {
  isWasteReceiverGetController,
  isWasteReceiverPostController,
  validatePost
} from './controller.js'

export const isWasteReceiver = {
  plugin: {
    name: 'isWasteReceiver',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.isWasteReceiver,
          options: {
            //   auth: 'session',
            cache: cacheControlNoStore
          },
          ...isWasteReceiverGetController
        },
        {
          method: 'POST',
          path: paths.isWasteReceiver,
          options: {
            //   auth: 'session',
            cache: cacheControlNoStore,
            ...validatePost
          },
          ...isWasteReceiverPostController
        }
      ])
    }
  }
}
