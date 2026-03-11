import { paths } from '../../../config/paths.js'
import { reviewPaymentController } from './controller.js'

export const reviewPayment = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.reviewPayment,
      ...reviewPaymentController
    }
  ]
}
