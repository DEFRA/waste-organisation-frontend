import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { statusCodes } from '../common/constants/status-codes.js'

export const error500Controller = {
  handler() {
    if (!config.get('featureFlags.testErrors')) {
      throw boom.notFound()
    }

    throw boom.internal('Test 500 error')
  }
}

export const organisationRequiredController = {
  handler(request, h) {
    if (!config.get('featureFlags.testErrors')) {
      throw boom.notFound()
    }

    const pageContent = content.organisationRequired(request)

    return h
      .view('error/organisation-required', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        body: pageContent.body,
        contactMessage: pageContent.contactMessage,
        signOutButton: pageContent.signOutButton,
        signOutUrl: pageContent.signOutUrl
      })
      .code(statusCodes.forbidden)
  }
}
