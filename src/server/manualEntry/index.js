import { paths } from '../../config/paths.js'
import {
  listController,
  submitController,
  addController,
  editController,
  wasteItemsController,
  wasteItemAddController,
  wasteItemEditController,
  wasteItemRemoveController,
  addItemController,
  duplicateController,
  removeController,
  confirmationController
} from './controller.js'

export const manualEntry = {
  authedRoutes: [
    { method: 'GET', path: paths.manualEntry, ...listController },
    { method: 'POST', path: paths.manualEntry, ...submitController },
    { method: 'GET', path: paths.manualEntryAdd, ...addController.get },
    { method: 'POST', path: paths.manualEntryAdd, ...addController.post },
    { method: 'GET', path: paths.manualEntryEdit, ...editController.get },
    { method: 'POST', path: paths.manualEntryEdit, ...editController.post },
    {
      method: 'GET',
      path: paths.manualEntryWasteItems,
      ...wasteItemsController.get
    },
    {
      method: 'POST',
      path: paths.manualEntryWasteItems,
      ...wasteItemsController.post
    },
    {
      method: 'GET',
      path: paths.manualEntryWasteItemAdd,
      ...wasteItemAddController.get
    },
    {
      method: 'POST',
      path: paths.manualEntryWasteItemAdd,
      ...wasteItemAddController.post
    },
    {
      method: 'GET',
      path: paths.manualEntryWasteItemEdit,
      ...wasteItemEditController.get
    },
    {
      method: 'POST',
      path: paths.manualEntryWasteItemEdit,
      ...wasteItemEditController.post
    },
    {
      method: 'POST',
      path: paths.manualEntryWasteItemRemove,
      ...wasteItemRemoveController
    },
    {
      method: 'GET',
      path: paths.manualEntryAddItem,
      ...addItemController
    },
    {
      method: 'POST',
      path: paths.manualEntryDuplicate,
      ...duplicateController
    },
    { method: 'POST', path: paths.manualEntryRemove, ...removeController },
    {
      method: 'GET',
      path: paths.manualEntryConfirmation,
      ...confirmationController
    }
  ]
}
