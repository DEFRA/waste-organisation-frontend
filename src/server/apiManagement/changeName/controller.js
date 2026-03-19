import boom from '@hapi/boom'
import joi from 'joi'
import { paths, pathTo } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const flashMessage = 'changeNameError'

export const apiChangeNameController = {
  get: {
    async handler(request, h) {
      const existingApiCodes = await request.backendApi.getApiCodes(
        request.auth.credentials.currentOrganisationId
      )

      const organisationName =
        request?.auth?.credentials?.currentOrganisationName
      const pageContent = content.apiChangeName(request, organisationName)

      const { apiCode } = request.params
      const matchingCode = existingApiCodes?.find((a) => a.code === apiCode)

      if (!matchingCode) {
        throw boom.notFound()
      }

      const [error] = request.yar.flash(flashMessage)
      let errorContent

      if (error) {
        errorContent = pageContent.error
        errorContent.href = '#name'
      }

      const pageTitle = errorContent
        ? `${pageContent.errorPrefix}: ${pageContent.title}`
        : pageContent.title

      return h.view('apiManagement/changeName/view', {
        pageTitle,
        heading: pageContent.heading,
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
          name: joi.string().required().trim()
        }),
        failAction: (request, h) => {
          request.yar.flash(flashMessage, true)
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
      await request.backendApi.updateApiCodes(
        request.auth.credentials.currentOrganisationId,
        request.params.apiCode,
        {
          name: request.payload.name
        }
      )

      return h.redirect(paths.apiList)
    }
  }
}
