import { paths } from '../../config/paths.js'
import { apiChangeNameController } from './changeName/controller.js'
import { apiDisableController } from './disable/controller.js'
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
    },
    {
      method: 'POST',
      path: paths.apiDisable,
      ...apiDisableController.post
    },
    {
      method: 'GET',
      path: paths.apiChangeName,
      ...apiChangeNameController.get
    },
    {
      method: 'POST',
      path: paths.apiChangeName,
      ...apiChangeNameController.post
    },
    {
      method: 'POST',
      path: paths.apiCreate,
      ...apiManagementController.create
    }
  ]
}
