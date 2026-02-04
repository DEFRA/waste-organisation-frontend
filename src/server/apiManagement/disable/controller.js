import joi from 'joi'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const flashMessage = 'disableError'

export const apiDisableController = {
  get: {
    handler(request, h) {
      const organisationName =
        request?.auth?.credentials?.currentOrganisationName
      const pageContent = content.apiDisable(request, organisationName)

      const [error] = request.yar.flash(flashMessage)
      let errorContent

      if (error) {
        errorContent = pageContent.error
        errorContent.href = '#disableYes'
      }

      const questions = Object.entries(pageContent.questions).map(
        (question) => {
          const [key, value] = question
          return {
            value: key,
            text: value,
            id: `disable${value}`,
            attributes: {
              'data-testid': `${key}-radio`
            },
            label: {
              attributes: {
                'data-testid': `${key}-label`
              }
            }
          }
        }
      )

      return h.view('apiManagement/disable/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        action: {
          url: paths.apiList,
          text: pageContent.continueAction
        },
        questions,
        error: errorContent,
        backLink: paths.startPage,
        caption: {}
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
