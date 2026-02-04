import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'
import crypto from 'node:crypto'

const flashDisabledMessage = 'disabledSuccessful'

export const apiManagementController = {
  list: {
    async handler(request, h) {
      const scriptNonce = crypto.randomBytes(16).toString('base64')

      request.contentSecurityPolicy = {
        scriptNonce
      }

      const organisationName =
        request?.auth?.credentials?.currentOrganisationName

      const pageContent = content.apiList(request, organisationName)

      const [code] = request.yar.flash(flashDisabledMessage)
      let disabledSuccessMessage

      if (code) {
        disabledSuccessMessage = pageContent.disabledSuccessMessage()
        disabledSuccessMessage.code = code
      }

      let apiCodes = await request.backendApi.getApiCodes(
        request.auth.credentials.currentOrganisationId
      )

      if (!apiCodes) {
        apiCodes = [
          await request.backendApi.createApiCodes(
            request.auth.credentials.currentOrganisationId,
            {}
          )
        ]
      }

      const enabledApiCodes = apiCodes.filter((apiCode) => !apiCode.isDisabled)
      const disabledApiCodes = apiCodes.filter((apiCode) => apiCode.isDisabled)

      return h.view('apiManagement/list/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        backLink: paths.nextAction,
        noEnabledApiCodes: pageContent.noEnabledApiCodes,
        apiCodeRows: convertToListRows(enabledApiCodes),
        disabledApiCodeRows: disabledApiCodes,
        additionalCode: pageContent.additionalCode,
        returnAction: pageContent.returnAction,
        scriptNonce,
        disabledSuccessMessage
      })
    }
  }
}

const convertToListRows = (apiCodes) => {
  const rows = []

  for (const [index, apiCode] of apiCodes.entries()) {
    const code = {
      key: {
        text: `API code ${index + 1}`,
        classes: `${index !== 0 ? 'govuk-!-padding-top-6' : ''}`
      },
      value: {
        text: apiCode.code
      },
      actions: {
        items: [
          {
            href: '/',
            text: 'Disable',
            classes: 'govuk-button govuk-button--secondary',
            attributes: {
              'data-copyText': apiCode.code
            }
          }
        ]
      }
    }

    const name = {
      key: {
        text: 'Name',
        classes: `${index !== apiCodes.length - 1 ? 'govuk-!-padding-bottom-6' : ''} govuk-!-padding-top-6`
      },
      value: {
        text: apiCode.name
      }
    }

    rows.push(code)
    rows.push(name)
  }

  return rows
}
