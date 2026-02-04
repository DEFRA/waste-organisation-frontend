import { paths } from '../../config/paths.js'
import { cannotUseServiceController } from './cannotUseService/controller.js'
import { ukPermitController } from './uk-permit/controller.js'

export const onboarding = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.ukPermit,
      ...ukPermitController.get
    },
    {
      method: 'POST',
      path: paths.ukPermit,
      ...ukPermitController.post
    },
    {
      method: 'GET',
      path: paths.cannotUseService,
      ...cannotUseServiceController
    }
  ]
}
