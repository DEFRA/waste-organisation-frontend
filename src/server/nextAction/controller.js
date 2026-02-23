import { content } from '../../config/content.js'
import { paths, pathTo } from '../../config/paths.js'
import joi from 'joi'
const flashMessage = 'isNextActionError'

export const nextActionController = {
  get: {
    async handler(request, h) {
      request.contentSecurityPolicy = {
        extraAuthOrigins: request.authProviderEndpoints
      }

      const organisationName =
        request?.auth?.credentials?.currentOrganisationName

      const pageContent = content.nextAction(request, organisationName)

      const [error] = request.yar.flash(flashMessage)
      let errorContent

      if (error) {
        errorContent = pageContent.error
      }

      const questions = Object.entries(pageContent.questions).map(
        (question) => {
          const [key, value] = question
          return {
            value: key,
            text: value,
            id: key,
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

      return h.view('nextAction/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        description: pageContent.description,
        link: pageContent.link,
        action: {
          url: paths.nextAction,
          text: pageContent.continueAction
        },
        questions,
        error: errorContent,
        backLink: paths.ukPermit
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: joi.object({
          nextAction: joi.string().required()
        }),
        failAction: (request, h) => {
          request.yar.flash(flashMessage, true)
          return h.redirect(paths.nextAction).takeover()
        }
      }
    },
    handler(request, h) {
      const nextAction = request.payload.nextAction
      const organisationId = request?.auth?.credentials?.currentOrganisationId

      if (nextAction === 'connectYourSoftware') {
        return h.redirect(paths.apiList)
      }

      if (nextAction === 'uploadSpreadsheet') {
        return h.redirect(pathTo(paths.spreadsheetUpload, { organisationId }))
      }

      if (nextAction === 'changeWasteReceiver') {
        return h.redirect(paths.signinDefraIdCallback)
      }

      request.yar.flash(flashMessage, true)
      return h.redirect(paths.nextAction).takeover()
    }
  }
}
