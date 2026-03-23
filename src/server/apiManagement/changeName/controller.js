import boom from '@hapi/boom'
import joi from 'joi'
import { paths, pathTo } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const flashKey = 'changeNameError'
const validationErrorType = 'validation'
const updateErrorType = 'update'

export const apiChangeNameController = {
  get: {
    async handler(request, h) {
      const existingApiCodes = await request.backendApi.getApiCodes(
        request.auth.credentials.currentOrganisationId
      )

      const organisationName =
        request?.auth?.credentials?.currentOrganisationName
      const pageContent = content.apiChangeName(request, organisationName)

      if (!existingApiCodes) {
        throw boom.badImplementation()
      }

      const { apiCode } = request.params
      const matchingCode = existingApiCodes.find((a) => a.code === apiCode)

      if (!matchingCode) {
        throw boom.notFound()
      }

      const [errorType] = request.yar.flash(flashKey)
      const errorsByType = {
        [validationErrorType]: pageContent.error,
        [updateErrorType]: pageContent.updateError
      }
      const errorContent = errorsByType[errorType]

      if (errorContent) {
        errorContent.href = '#name'
      }

      const pageTitle = errorContent
        ? `${pageContent.errorPrefix}: ${pageContent.title}`
        : pageContent.title

      return h.view('apiManagement/changeName/view', {
        pageTitle,
        heading: pageContent.heading,
        label: pageContent.label,
        hint: pageContent.hint,
        currentName: matchingCode.name,
        action: {
          url: pathTo(paths.apiChangeName, { apiCode }),
          text: pageContent.saveAction
        },
        error: errorContent,
        backLink: paths.apiList
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: joi.object({
          name: joi.string().trim().min(1).required()
        }),
        failAction: (request, h) => {
          request.yar.flash(flashKey, validationErrorType)
          return h
            .redirect(
              pathTo(paths.apiChangeName, {
                apiCode: request.params.apiCode
              })
            )
            .takeover()
        }
      }
    },
    async handler(request, h) {
      const result = await request.backendApi.updateApiCodes(
        request.auth.credentials.currentOrganisationId,
        request.params.apiCode,
        {
          name: request.payload.name
        }
      )

      if (!result) {
        request.yar.flash(flashKey, updateErrorType)
        return h.redirect(
          pathTo(paths.apiChangeName, {
            apiCode: request.params.apiCode
          })
        )
      }

      return h.redirect(paths.apiList)
    }
  }
}
