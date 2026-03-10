import { paths } from '../../config/paths.js'
import { initiatePaymentController } from './controller.js'

export const initiatePayment = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.initiatePayment,
      ...initiatePaymentController
    }
  ]
}
