import { paths } from '../../config/paths.js'
import { serviceChargeController } from './paymentInfo/controller.js'
import { reviewPaymentController } from './reviewPayment/controller.js'
import { paymentDetailsController } from './paymentDetails/controller.js'
import { initiatePaymentController } from './initiatePayment/controller.js'
import { config } from '../../config/config.js'

export const serviceCharge = config.get('featureFlags.serviceCharge')
  ? {
      authedRoutes: [
        {
          method: 'GET',
          path: paths.serviceCharge,
          ...serviceChargeController
        },
        {
          method: 'GET',
          path: paths.reviewPayment,
          ...reviewPaymentController
        },
        {
          method: 'GET',
          path: paths.paymentDetails,
          ...paymentDetailsController
        },
        {
          method: 'GET',
          path: paths.initiatePayment,
          ...initiatePaymentController
        }
      ]
    }
  : { authedRoutes: [] }
