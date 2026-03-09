import { paths } from '../../config/paths.js'
import { serviceChargeController } from './controller.js'

export const serviceCharge = {
  authedRoutes: [
    {
      method: 'GET',
      path: paths.serviceCharge,
      ...serviceChargeController
    }
  ]
}
