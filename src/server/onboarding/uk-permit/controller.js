import joi from 'joi'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const flashMessage = 'isPermitError'
const logger = createLogger()

export const ukPermitController = {
  get: {
    handler(request, h) {
      request.contentSecurityPolicy = {
        extraAuthOrigins: request.authProviderEndpoints
      }
      logger.info(
        'request.contentSecurityPolicy: ',
        request.contentSecurityPolicy
      )
      const pageContent = content.ukPermit()

      const [error] = request.yar.flash(flashMessage)
      let errorContent

      if (error) {
        errorContent = pageContent.error
      }

      return h.view('onboarding/uk-permit/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        action: {
          url: paths.isPermit,
          text: pageContent.continueAction
        },
        questions: pageContent.questions,
        error: errorContent
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: joi.object({
          isPermit: joi
            .string()
            .required()
            .regex(/^(yes|no)$/)
        }),
        failAction: (request, h) => {
          request.yar.flash(flashMessage, true)
          return h.redirect(paths.ukPermit).takeover()
        }
      }
    },
    handler(request, h) {
      const isPermit = request.payload.isPermit

      if (isPermit === 'yes') {
        return h.redirect(paths.signinDefraIdCallback)
      }

      return h.redirect(paths.cannotUseService)
    }
  }
}
