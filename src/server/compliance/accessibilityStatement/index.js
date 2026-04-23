import { paths } from '../../../config/paths.js'
import { accessibilityStatementController } from './controller.js'

export const accessibilityStatement = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.accessibility,
      ...accessibilityStatementController
    }
  ]
}
