import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import {
  addWasteReceiverGetController,
  addWasteReceiverPostController,
  validatePost
} from './controller.js'

export const addWasteReceiver = {
  plugin: {
    name: 'addWasteReceiver',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.addWasteReceiver,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...addWasteReceiverGetController
        },
        {
          method: 'POST',
          path: paths.addWasteReceiver,
          options: {
            auth: 'session',
            cache: cacheControlNoStore,
            ...validatePost
          },
          ...addWasteReceiverPostController
        }
      ])
    }
  }
}
