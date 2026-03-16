import { paths } from '../../config/paths.js'
import { privacyNoticeController } from './controller.js'

export const privacy = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.privacyNotice,
      ...privacyNoticeController
    }
  ]
}
