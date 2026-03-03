import { config } from '../../config/config.js'
import { paths } from '../../config/paths.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { content } from '../../config/content.js'
import {
  initiateUpload,
  createCallbackHandler
} from '../common/helpers/cdp-upload.js'

const logger = createLogger()

export const beginUpload = {
  async handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.updateSpreadsheetUpload(
      request,
      organisationName
    )

    /* v8 ignore start - covered by integration tests but v8 coverage merge across test files misattributes */
    const { uploadId, uploadUrl } = await initiateUpload(
      request.auth.credentials.currentOrganisationId,
      request.auth.credentials.email,
      {
        firstName: request.auth.credentials.firstName,
        lastName: request.auth.credentials.lastName,
        displayName: request.auth.credentials.displayName
      },
      {
        callbackPath: paths.updateSpreadsheetUploadCallback,
        redirectPath: paths.updateSpreadsheetUploaded,
        uploadType: 'update'
      }
    )
    logger.info(`uploaded requested - ${uploadId} ${uploadUrl}`)
    const { origin } = new URL(
      uploadUrl?.startsWith('h') ? uploadUrl : config.get('fileUpload.url')
    )
    request.contentSecurityPolicy = {
      extraAuthOrigins: origin
    }

    return h.view('updateSpreadsheet/begin-upload', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      description: pageContent.description,
      action: uploadUrl,
      backLink: paths.nextAction
    })
  }
}

export const fileUploaded = {
  /* v8 ignore stop */
  async handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.updateSpreadsheetUploaded(
      request,
      organisationName
    )

    return h.view('updateSpreadsheet/file-uploaded', {
      pageTitle: pageContent.heading.text,
      content: pageContent.content,
      returnAction: {
        text: pageContent.returnLink,
        link: paths.nextAction
      }
    })
  }
}

export const callback = createCallbackHandler()
