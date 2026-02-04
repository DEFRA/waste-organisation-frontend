import { paths } from '../../config/paths.js'
import { apiDisableController } from './disable/controller.js'
// import { apiDisableController } from './disable/controller.js'
import { apiManagementController } from './list/controller.js'

export const apiManagement = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.apiList,
      ...apiManagementController.list
    },
    {
      method: 'GET',
      path: paths.apiDisable,
      ...apiDisableController.get
    }
    // {
    //   method: 'POST',
    //   path: paths.ukPermit,
    //   ...ukPermitController.post
    // },
    // {
    //   method: 'GET',
    //   path: paths.cannotUseService,
    //   ...cannotUseServiceController
    // }
  ]
}
