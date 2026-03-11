import { paths } from '../../../config/paths.js'
import { paymentDetailsController } from './controller.js'

export const paymentDetails = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.paymentDetails,
      ...paymentDetailsController
    }
  ]
}
