import { paths } from '../../config/paths.js'
import { termsController } from './controller.js'

export const terms = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.terms,
      ...termsController
    }
  ]
}
