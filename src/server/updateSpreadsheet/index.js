import { paths } from '../../config/paths.js'
import { beginUpload, fileUploaded, callback } from './controller.js'

const createRoute = ([method, path, controller]) => ({
  method: method || 'GET',
  path,
  ...controller
})

export const updateSpreadsheet = {
  authedRoutes: [
    ['GET', paths.updateSpreadsheetUpload, beginUpload],
    ['GET', paths.updateSpreadsheetUploaded, fileUploaded]
  ].map(createRoute),
  openRoutes: [['POST', paths.updateSpreadsheetUploadCallback, callback]].map(
    createRoute
  )
}
