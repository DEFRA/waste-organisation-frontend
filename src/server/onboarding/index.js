import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import {
  isWasteReceiverGetController,
  onboardingGetController
  // isWasteReceiverPostController
} from './controller.js'

export const onboarding = {
  plugin: {
    name: 'onboarding',
    register(server) {
      server.route(
        [
          ['GET', paths.onboarding, onboardingGetController],
          ['GET', paths.isWasteReceiver, isWasteReceiverGetController]
          // ['POST', isWasteReceiverPostController]
        ].map(([method, path, controller]) => ({
          method,
          path,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...controller
        }))
      )
    }
  }
}
