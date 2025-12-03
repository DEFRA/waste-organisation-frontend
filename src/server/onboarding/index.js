import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { onboardingGetController } from './controller.js'

export const onboarding = {
  plugin: {
    name: 'onboarding',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.onboarding,
          options: {
            auth: 'session',
            cache: cacheControlNoStore
          },
          ...onboardingGetController
        }
      ])
    }
  }
}
