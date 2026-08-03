import { paths } from '../../config/paths.js'
import { localAuthorityGuidanceController } from './localAuthorityGuidance/controller.js'
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
      path: paths.localAuthorityGuidance,
      ...localAuthorityGuidanceController
    }
  ]
}
