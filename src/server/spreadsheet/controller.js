import wreck from '@hapi/wreck'
import { config } from '../../config/config.js'
import { pathTo, paths } from '../../config/paths.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import boom from '@hapi/boom'
import { content } from '../../config/content.js'

const logger = createLogger()

/* v8 ignore start */
const initiateUpload = async (orgId) => {
  try {
    const { url, bucketName, preSharedKey } = config.get('fileUpload')
    const initiateUrl = `${url}/initiate`
    const callbackUrl =
      config.get('appBaseUrl') +
      pathTo(paths.spreadsheetUploadCallback, {
        organisationId: orgId
      })
    const redirectUrl = pathTo(paths.spreadsheetUploaded, {
      organisationId: orgId
    })
    logger.info(
      `Info initiating upload: ${initiateUrl} callback: ${callbackUrl} redirect: ${redirectUrl} bucketName: ${bucketName}`
    )
    const { payload } = await wreck.post(initiateUrl, {
      json: 'strict',
      payload: {
        redirect: pathTo(paths.spreadsheetUploaded, {
          organisationId: orgId
        }),
        callback: callbackUrl,
        s3Bucket: bucketName,
        metadata: {
          preSharedKey
        }
      }
    })
    return payload
  } catch (e) {
    logger.error(`Error initiating upload - ${e}`)
    logger.error(`Error payload - ${e.payload}`)
    throw e
  }
}
/* v8 ignore stop */

export const beginUpload = {
  async handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.spreadsheetUpload(request, organisationName)

    const { uploadId, uploadUrl } = await initiateUpload(
      request.auth.credentials.currentOrganisationId
    )
    /* v8 ignore start */
    logger.info(`uploaded requested - ${uploadId} ${uploadUrl}`)
    const { origin } = new URL(
      uploadUrl?.startsWith('h') ? uploadUrl : config.get('fileUpload.url')
    )
    request.contentSecurityPolicy = {
      extraAuthOrigins: origin
    }

    return h.view('spreadsheet/begin-upload', {
      pageTitle: 'Upload a receipt of waste movement spreadsheet',
      heading: pageContent.heading,
      action: uploadUrl,
      backLink: paths.nextAction
    })
  }
}

export const fileUploaded = {
  /* v8 ignore stop */
  async handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.spreadsheetUploaded(request, organisationName)

    return h.view('spreadsheet/file-uploaded', {
      pageTitle: pageContent.heading.text,
      content: pageContent.content,
      returnAction: {
        text: pageContent.returnLink,
        link: paths.nextAction
      }
    })
  }
}

const saveSpreadsheet = async (backendApi, organisationId, spreadsheet) => {
  try {
    return await backendApi.saveSpreadsheet(
      organisationId,
      spreadsheet.fileId,
      spreadsheet
    )
  } catch (e) {
    logger.error(
      `Error in spreadsheet callback ${e} - spreadsheet ${spreadsheet}`
    )
    throw e
  }
}

export const callback = {
  async handler(request, h) {
    const { preSharedKey } = config.get('fileUpload')
    if (request.payload?.metadata?.preSharedKey !== preSharedKey) {
      throw boom.forbidden('Not Allowed')
    }
    const spreadsheets = request.payload?.form
    if (!spreadsheets) {
      return h.response({ message: 'success' })
    }
    for (const spreadsheet of Object.values(spreadsheets)) {
      const s = await saveSpreadsheet(
        request.backendApi,
        request.params.organisationId,
        spreadsheet
      )
      if (!s) {
        throw boom.badGateway()
      }
    }
    return h.response({ message: 'success' })
  }
}
