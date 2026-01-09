import { paths } from '../../config/paths.js'
import { ukPermitController } from './uk-permit/controller.js'

export const onboarding = {
  plugin: {
    name: 'onboarding',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: paths.ukPermit,
          ...ukPermitController.get
        },
        {
          method: 'POST',
          path: paths.ukPermit,
          ...ukPermitController.post
        }
      ])
    }
  }
}
