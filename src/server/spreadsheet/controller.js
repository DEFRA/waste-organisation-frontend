import wreck from '@hapi/wreck'
import { config } from '../../config/config.js'
import { pathTo, paths } from '../../config/paths.js'

// POST https://cdp-uploader.{env}.cdp-int.defra.cloud/initiate
// Content-Type: application/json

// "callback": "https://tenant-service.{env}.cdp-int.defra.cloud/upload-received/reference-identifier",

const initiateUpload = async (orgId) => {
  const { url, bucketName } = config.get('fileUpload')
  const { payload } = await wreck.post(`${url}/initiate`, {
    json: 'strict',
    payload: {
      redirect: pathTo(paths.spreadsheetUploaded, {
        organisationId: orgId
      }),
      callback:
        config.get('appBaseUrl') +
        pathTo(paths.spreadsheetUploadCallback, {
          organisationId: orgId
        }),
      s3Bucket: bucketName,
      metadata: {
        reference: 'reference-identifier',
        customerId: 'customer'
      }
    }
  })
  return payload
}

export const beginUpload = {
  async handler(request, h) {
    const { uploadId, uploadUrl, statusUrl } = await initiateUpload(
      request.auth.credentials.currentOrganisationId
    )
    const { origin } = new URL(uploadUrl)
    request.contentSecurityPolicy = {
      extraAuthOrigins: origin
    }

    console.log(
      'uploadId, uploadUrl, statusUrl: ',
      uploadId,
      uploadUrl,
      statusUrl
    )
    await request.backendApi.saveSpreadsheet(
      request.auth.credentials.currentorganisationid,
      uploadId,
      statusUrl
    )
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
  async handler(request, h) {
    return h.view('spreadsheet/file-uploaded', {
      pageTitle: 'Upload a Waste Movement Spreadsheet'
    })
  }
}

export const callback = {
  async handler(request, h) {
    // TODO maybe delay response if org / upload id not found?
    return h.response({ message: 'success' })
  }
}
