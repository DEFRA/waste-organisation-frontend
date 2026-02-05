import joi from 'joi'
import { paths, pathTo } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const flashMessage = 'disableError'
const flashDisabledMessage = 'disabledSuccessful'

export const apiDisableController = {
  get: {
    handler(request, h) {
      const organisationName =
        request?.auth?.credentials?.currentOrganisationName
      const pageContent = content.apiDisable(request, organisationName)

      const { apiCode } = request.params

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
        caption: pageContent.caption,
        warning: pageContent.warning,
        action: {
          url: pathTo(paths.apiDisable, { apiCode }),
          text: pageContent.continueAction
        },
        questions,
        error: errorContent,
        backLink: paths.startPage,
        apiCode
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: joi.object({
          disable: joi
            .string()
            .required()
            .regex(/^(yes|no)$/)
        }),
        failAction: (request, h) => {
          request.yar.flash(flashMessage, true)
          return h
            .redirect(
              pathTo(paths.apiDisable, {
                apiCode: request.params.apiCode
              })
            )
            .takeover()
        }
      }
    },
    async handler(request, h) {
      const disable = request.payload.disable

      console.log('request.params.apiCode', request.params.apiCode)

      if (disable === 'yes') {
        await request.backendApi.updateApiCodes(
          request.auth.credentials.currentOrganisationId,
          request.params.apiCode,
          {
            isDisabled: true
          }
        )
        request.yar.flash(flashDisabledMessage, request.params.apiCode)
        return h.redirect(paths.apiList)
      }

      return h.redirect(paths.apiList)
    }
  }
}
