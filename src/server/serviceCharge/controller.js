import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const serviceChargeController = {
  handler(request, h) {
    if (!config.get('featureFlags.serviceCharge')) {
      throw boom.notFound()
    }

    const pageContent = content.serviceCharge(request)

    return h.view('serviceCharge/index', {
      pageTitle: pageContent.title,
      heading: {
        text: pageContent.heading
      },
      cost: pageContent.cost,
      requirementsIntro: pageContent.requirementsIntro,
      requirements: pageContent.requirements,
      warning: pageContent.warning,
      payServiceCharge: pageContent.payServiceCharge,
      payServiceChargeHref: paths.reviewPayment,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.account
      }
    })
  }
}
