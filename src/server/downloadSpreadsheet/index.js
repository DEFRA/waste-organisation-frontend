import { paths } from '../../config/paths.js'
import { downloadSpreadsheetController } from './controller.js'

export const downloadSpreadsheet = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.downloadSpreadsheet,
      ...downloadSpreadsheetController.get
    },
    {
      method: 'GET',
      path: paths.downloadSpreadsheetFile,
      ...downloadSpreadsheetController.download
    }
  ]
}
