import joi from 'joi'
import { paths } from '../../../config/paths.js'

const flashMessage = 'isPermitError'

export const ukPermitController = {
  get: {
    handler(request, h) {
      const [error] = request.yar.flash(flashMessage)

      return h.view('onboarding/uk-permit/view', {
        pageTitle: 'ukPermit',
        heading:
          'Do you operate one or more licensed or permitted waste receiving sites?',
        action: paths.isPermit,
        error
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
