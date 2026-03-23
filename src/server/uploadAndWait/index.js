import { paths } from '../../config/paths.js'
import { uploadAndWaitController } from './controller.js'

const createRoute = ([method, path, controller]) => ({
  method: method || 'GET',
  path,
  ...controller
})

export const uploadAndWait = {
  authedRoutes: [['GET', paths.uploadAndWait, uploadAndWaitController]].map(
    createRoute
  )
}
