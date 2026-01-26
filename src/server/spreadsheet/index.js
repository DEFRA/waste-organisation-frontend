import { paths } from '../../config/paths.js'
import { cacheControlNoStore } from '../../config/config.js'
import { beginUpload, fileUploaded, callback } from './controller.js'

export const spreadsheet = {
  plugin: {
    name: 'spreadsheet',
    register(server) {
      server.route(
        [
          ['GET', paths.spreadsheetUpload, beginUpload, 'session'],
          ['GET', paths.spreadsheetUploaded, fileUploaded, 'session'],
          ['POST', paths.spreadsheetUploadCallback, callback]
        ].map(([method, path, controller, auth]) => ({
          method: method || 'GET',
          path,
          options: {
            auth,
            cache: cacheControlNoStore
          },
          ...controller
        }))
      )
    }
  }
}
