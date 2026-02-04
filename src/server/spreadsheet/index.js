import { paths } from '../../config/paths.js'
import { beginUpload, fileUploaded, callback } from './controller.js'

const createRoute = ([method, path, controller]) => ({
  method: method || 'GET',
  path,
  ...controller
})

export const spreadsheet = {
  authedRoutes: [
    ['GET', paths.spreadsheetUpload, beginUpload, 'session'],
    ['GET', paths.spreadsheetUploaded, fileUploaded, 'session']
  ].map(createRoute),
  openRoutes: [['POST', paths.spreadsheetUploadCallback, callback]].map(
    createRoute
  )
}
