import { paths } from '../../config/paths.js'
import {
  beginUpload as createBeginUpload,
  fileUploaded as createFileUploaded,
  callback as createCallback
} from './create/controller.js'
import {
  beginUpload as updateBeginUpload,
  fileUploaded as updateFileUploaded,
  callback as updateCallback
} from './update/controller.js'

import { downloadSpreadsheetController } from './downloadSpreadsheet/controller.js'

const createRoute = ([method, path, controller]) => ({
  method: method || 'GET',
  path,
  ...controller
})

export const spreadsheet = {
  authedRoutes: [
    ['GET', paths.spreadsheetUpload, createBeginUpload, 'session'],
    ['GET', paths.spreadsheetUploaded, createFileUploaded, 'session'],
    ['GET', paths.updateSpreadsheetUpload, updateBeginUpload],
    ['GET', paths.updateSpreadsheetUploaded, updateFileUploaded],
    ['GET', paths.downloadSpreadsheet, downloadSpreadsheetController]
  ].map(createRoute),
  openRoutes: [
    ['POST', paths.spreadsheetUploadCallback, createCallback],
    ['POST', paths.updateSpreadsheetUploadCallback, updateCallback]
  ].map(createRoute)
}
