import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import {
  onboardingGetController,
  isWasteReceiverGetController,
  isWasteReceiverPostController
} from './controller.js'

export const onboarding = {
  plugin: {
    name: 'onboarding',
    register(server) {
      server.route(
        [
          ['GET', onboardingGetController],
          ['GET', isWasteReceiverGetController],
          ['POST', isWasteReceiverPostController]
        ].map(([method, controller]) => ({
          method,
          path: paths.onboarding,
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
