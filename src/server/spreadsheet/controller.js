import wreck from '@hapi/wreck'
import { config } from '../../config/config.js'
import { pathTo, paths } from '../../config/paths.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

// POST https://cdp-uploader.{env}.cdp-int.defra.cloud/initiate
// Content-Type: application/json

// "callback": "https://tenant-service.{env}.cdp-int.defra.cloud/upload-received/reference-identifier",

const preSharedKey = 'a9f7971f-4992-49eb-8fcc-83c93b5f233c'

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
        // Note: Probably need to track the user to notify in some way?
        preSharedKey
      }
    }
  })
  return payload
}

export const beginUpload = {
  async handler(request, h) {
    const { _uploadId, uploadUrl, _statusUrl } = await initiateUpload(
      request.auth.credentials.currentOrganisationId
    )
    const { origin } = new URL(uploadUrl)
    request.contentSecurityPolicy = {
      extraAuthOrigins: origin
    }

    // Note: we can only track the statusUrl if we save the details here, but we don't get the uploadId in the callback
    // (without parsing it out of the `s3Key`). However, I don't think we have an actual need for this other that
    // debugging later, unless we need to store something about the user that uploaded the file in order to notify them
    // later?

    // await request.backendApi.saveSpreadsheet(
    //   request.auth.credentials.currentOrganisationId,
    //   uploadId,
    //   { statusUrl }
    // )
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
      pageTitle: 'Upload a Waste Movement Spreadsheet',
      uploadLink: pathTo(paths.spreadsheetUpload, {
        organisationId: request.params.organisationId
      })
    })
  }
}

export const callback = {
  async handler(request, h) {
    // TODO maybe delay response if org / upload id not found?
    //  cdp-uploader: {
    //    "uploadId": "15c9e2af-17f8-4e6b-8a83-252c412c41c6",
    //    "uploadStatus": "ready",
    //    "fileIds": [
    //      "3f135f3c-48f2-4f10-8773-7ec512fe3abc"
    //    ]
    //  }

    // callback request.params:  { organisationId: '7f2f65e0-4858-11f0-afd0-f3af378128f9' }
    // callback request.payload:  {
    //   uploadStatus: 'ready',
    //   metadata: { reference: 'reference-identifier', customerId: 'customer' },
    //   form: {
    //     fileUpload1: {
    //       fileId: '231916bf-b6bd-48ed-adf3-a887c274071d',
    //       filename: 'bumblebee.jpg',
    //       contentType: 'image/jpeg',
    //       fileStatus: 'complete',
    //       contentLength: 140886,
    //       checksumSha256: '8/pBJD+bqgM4ds378XnrIQ3NNBitBwOOCNttUYYmxDs=',
    //       detectedContentType: 'image/jpeg',
    //       s3Key: '32792dc6-6ed1-41ea-aaa5-bd774974545c/231916bf-b6bd-48ed-adf3-a887c274071d',
    //       s3Bucket: 'my-bucket'
    //     }
    //   },
    //   numberOfRejectedFiles: 0
    // }

    if (request.payload?.metadata?.preSharedKey !== preSharedKey) {
      return h.code(statusCodes.forbidden)
    } else {
      const spreadsheets = Object.values(request.payload?.form)
      for (const spreadsheet of spreadsheets) {
        try {
          await request.backendApi.saveSpreadsheet(
            request.params.organisationId,
            spreadsheet.fileId,
            spreadsheet
          )
        } catch (e) {
          logger.error(
            `Error in spreadsheet callback ${e} - spreadsheet ${spreadsheet}`
          )
        }
      }
      return h.response({ message: 'success' })
    }
  }
}
