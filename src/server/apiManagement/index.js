import { paths } from '../../config/paths.js'
import { apiManagementController } from './list/controller.js'

export const apiManagement = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.apiList,
      ...apiManagementController.list
    },
    {
      method: 'POST',
      path: paths.apiCreate,
      ...apiManagementController.create
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
