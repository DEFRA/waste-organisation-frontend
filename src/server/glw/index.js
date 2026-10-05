import { config } from '../../config/config.js'
import { accountController } from './account/controller.js'
import { paths } from './paths.js'
import { RegistrationListController } from './registrations/list/controller.js'
import { RegistrationQuestionsController } from './registrations/questions/controller.js'

const glwFeatureFlag = config.get('featureFlags.glw')

export const glw = glwFeatureFlag
  ? {
      authedRoutes: [
        {
          method: 'GET',
          path: paths.account,
          ...accountController
        },
        {
          method: 'GET',
          path: paths.registrationList,
          ...RegistrationListController
        },
        {
          method: 'GET',
          path: paths.registrationQuestions,
          ...RegistrationQuestionsController
        }
      ]
    }
  : {
      authedRoutes: []
    }
