/* v8 ignore start - covered by integration tests but v8 coverage merge across test files misattributes */
import wreck from '@hapi/wreck'
import boom from '@hapi/boom'
import { config } from '../../../config/config.js'
import { pathTo } from '../../../config/paths.js'
import { createLogger } from './logging/logger.js'
import { encrypt } from './encryption/encrypt.js'

const logger = createLogger()

export const initiateUpload = async (
  orgId,
  email,
  name,
  { callbackPath, redirectPath, uploadType }
) => {
  try {
    const { url, bucketName, preSharedKey } = config.get('fileUpload')
    const initiateUrl = `${url}/initiate`
    const callbackUrl =
      config.get('appBaseUrl') + pathTo(callbackPath, { organisationId: orgId })
    const redirectUrl = pathTo(redirectPath, { organisationId: orgId })
    logger.info(
      `Info initiating upload: ${initiateUrl} callback: ${callbackUrl} redirect: ${redirectUrl} bucketName: ${bucketName}`
    )

    const encryptedEmail = encrypt(email, config.get('encryptionKey'))
    const encryptedName = encrypt(
      JSON.stringify(name),
      config.get('encryptionKey')
    )

    const { payload } = await wreck.post(initiateUrl, {
      json: 'strict',
      payload: {
        redirect: redirectUrl,
        callback: callbackUrl,
        s3Bucket: bucketName,
        metadata: {
          preSharedKey,
          encryptedEmail,
          encryptedName,
          uploadType
        },
        mimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        maxFileSize: 2 * 1000 * 1000 //2MB
      }
    })
    return payload
  } catch (e) {
    logger.error(`Error initiating upload - ${e}`)
    logger.error(`Error payload - ${e.payload}`)
    throw e
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
/* v8 ignore stop */

export const createCallbackHandler = () => ({
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
      spreadsheet.encryptedEmail = request.payload?.metadata?.encryptedEmail
      spreadsheet.encryptedName = request.payload?.metadata?.encryptedName

      spreadsheet.uploadType = request.payload?.metadata?.uploadType
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
})
