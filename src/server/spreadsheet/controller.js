import wreck from '@hapi/wreck'
import { config } from '../../config/config.js'
import { pathTo, paths } from '../../config/paths.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import boom from '@hapi/boom'

const logger = createLogger()

export const preSharedKey = 'a9f7971f-4992-49eb-8fcc-83c93b5f233c'

const initiateUpload = async (orgId) => {
  try {
    const { url, bucketName } = config.get('fileUpload')
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
      `Info initiating upload: ${initiateUrl} callback: ${callbackUrl} redirect: ${redirectUrl}`
    )
    /* v8 ignore start */
    const { payload } = await wreck.post(initiateUrl, {
      json: 'strict',
      payload: {
        redirect: redirectUrl,
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
    throw e
  }
}
/* v8 ignore stop */

export const beginUpload = {
  async handler(request, h) {
    const { uploadId, uploadUrl } = await initiateUpload(
      request.auth.credentials.currentOrganisationId
    )
    logger.info(`uploaded requested - ${uploadId}`)
    /* v8 ignore start */
    const { origin } = new URL(uploadUrl)
    request.contentSecurityPolicy = {
      extraAuthOrigins: origin
    }

    return h.view('spreadsheet/begin-upload', {
      pageTitle: 'Upload a Waste Movement Spreadsheet',
      action: uploadUrl,
      uploadWidgetSettings: {
        id: 'file-upload-1',
        name: 'fileUpload1',
        label: {
          text: 'Upload a waste movement spreadsheet'
        },
        javascript: true,
        accept: '.xlsx'
      }
    })
  }
}

export const fileUploaded = {
  /* v8 ignore stop */
  async handler(request, h) {
    return h.view('spreadsheet/file-uploaded', {
      pageTitle: 'Upload a Waste Movement Spreadsheet',
      uploadLink: pathTo(paths.spreadsheetUpload, {
        organisationId: request.params.organisationId
      })
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
