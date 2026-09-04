import { paths, pathTo } from '../../../config/paths.js'
import { apiManagement } from '../content.js'
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

      const pageContent = apiManagement.apiList(request, organisationName)

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
        apiCodeRows: convertToListRows(
          enabledApiCodes,
          pageContent.changeName,
          pageContent.words
        ),
        disabledApiCodeRows: disabledApiCodes,
        additionalCode: pageContent.additionalCode,
        returnAction: pageContent.returnAction,
        createAction: paths.apiCreate,
        words: pageContent.words,
        scriptNonce,
        disabledSuccessMessage
      })
    }
  },
  create: {
    async handler(request, h) {
      await request.backendApi.createApiCodes(
        request.auth.credentials.currentOrganisationId,
        {}
      )
      return h.redirect(paths.apiList).takeover()
    }
  }
}

const convertToListRows = (apiCodes, changeNameContent, words) => {
  const rows = []

  for (const [index, apiCode] of apiCodes.entries()) {
    const code = {
      key: {
        text: `${words.apiCode} ${index + 1}`,
        classes: `${index !== 0 ? 'govuk-!-padding-top-6' : ''}`
      },
      value: {
        text: apiCode.code
      },
      actions: {
        items: [
          {
            href: pathTo(paths.apiDisable, { apiCode: apiCode.code }),
            text: words.disable,
            classes: 'govuk-button govuk-button--secondary',
            attributes: {
              'data-copyText': apiCode.code,
              'data-codeName': apiCode.name,
              'aria-label': `${words.disable} ${apiCode.name} ${words.code}`
            }
          }
        ]
      }
    }

    const name = {
      key: {
        text: words.name,
        classes: `${index !== apiCodes.length - 1 ? 'govuk-!-padding-bottom-6' : ''} govuk-!-padding-top-6`
      },
      value: {
        text: apiCode.name
      },
      actions: {
        items: [
          {
            href: pathTo(paths.apiChangeName, { apiCode: apiCode.code }),
            text: changeNameContent.action,
            visuallyHiddenText: `${changeNameContent.hiddenText} ${apiCode.name}`,
            attributes: {
              'aria-label': `${words.change} ${apiCode.name} ${words.codeName}`
            }
          }
        ]
      }
    }

    rows.push(code)
    rows.push(name)
  }

  return rows
}
