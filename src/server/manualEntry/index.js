import { paths } from '../../config/paths.js'
import {
  listController,
  submitController,
  addController,
  editController,
  duplicateController,
  removeController,
  confirmationController
} from './controller.js'

export const manualEntry = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.manualEntry,
      ...listController
    },
    {
      method: 'POST',
      path: paths.manualEntry,
      ...submitController
    },
    {
      method: 'GET',
      path: paths.manualEntryAdd,
      ...addController.get
    },
    {
      method: 'POST',
      path: paths.manualEntryAdd,
      ...addController.post
    },
    {
      method: 'GET',
      path: paths.manualEntryEdit,
      ...editController.get
    },
    {
      method: 'POST',
      path: paths.manualEntryEdit,
      ...editController.post
    },
    {
      method: 'POST',
      path: paths.manualEntryDuplicate,
      ...duplicateController
    },
    {
      method: 'POST',
      path: paths.manualEntryRemove,
      ...removeController
    },
    {
      method: 'GET',
      path: paths.manualEntryConfirmation,
      ...confirmationController
    }
  ]
}
