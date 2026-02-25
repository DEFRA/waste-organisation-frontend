import { vi, describe, beforeEach, expect } from 'vitest'
import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'

const wreckPostMock = vi.fn()
const encryptMock = vi.fn()

vi.mock('@hapi/wreck', () => ({
  default: { post: wreckPostMock }
}))

vi.mock('./encryption/encrypt.js', () => ({
  encrypt: encryptMock
}))

const { initiateUpload, createCallbackHandler } = await import(
  './cdp-upload.js'
)

const fileUploadConfig = config.get('fileUpload')
const configuredPreSharedKey = fileUploadConfig.preSharedKey

describe('initiateUpload', () => {
  beforeEach(() => {
    wreckPostMock.mockReset()
    encryptMock.mockReset()
  })

  test('posts to the initiate endpoint and returns the payload', async () => {
    const expectedPayload = {
      uploadId: 'upload-1',
      uploadUrl: 'http://upload/url'
    }
    wreckPostMock.mockResolvedValue({ payload: expectedPayload })
    encryptMock.mockReturnValue(['iv', 'cipher', 'tag'])

    const result = await initiateUpload('org-1', 'user@example.com', {
      callbackPath: paths.spreadsheetUploadCallback,
      redirectPath: paths.spreadsheetUploaded,
      uploadType: 'create'
    })

    expect(result).toEqual(expectedPayload)
    expect(wreckPostMock).toHaveBeenCalledWith(
      `${fileUploadConfig.url}/initiate`,
      {
        json: 'strict',
        payload: {
          redirect: '/organisation/org-1/spreadsheet/file-uploaded',
          callback: expect.stringContaining(
            '/organisation/org-1/spreadsheet/upload-callback'
          ),
          s3Bucket: fileUploadConfig.bucketName,
          metadata: {
            preSharedKey: fileUploadConfig.preSharedKey,
            encryptedEmail: ['iv', 'cipher', 'tag'],
            uploadType: 'create'
          }
        }
      }
    )
    expect(encryptMock).toHaveBeenCalledWith(
      'user@example.com',
      config.get('encryptionKey')
    )
  })

  test('passes update uploadType for update spreadsheet paths', async () => {
    wreckPostMock.mockResolvedValue({ payload: { uploadId: 'u-2' } })
    encryptMock.mockReturnValue(['iv', 'cipher', 'tag'])

    await initiateUpload('org-2', 'admin@example.com', {
      callbackPath: paths.updateSpreadsheetUploadCallback,
      redirectPath: paths.updateSpreadsheetUploaded,
      uploadType: 'update'
    })

    const callPayload = wreckPostMock.mock.calls[0][1].payload
    expect(callPayload.redirect).toBe(
      '/organisation/org-2/update-spreadsheet/file-uploaded'
    )
    expect(callPayload.callback).toContain(
      '/organisation/org-2/update-spreadsheet/upload-callback'
    )
    expect(callPayload.metadata.uploadType).toBe('update')
  })

  test('throws and logs when wreck.post fails', async () => {
    const uploadError = new Error('connection refused')
    wreckPostMock.mockRejectedValue(uploadError)
    encryptMock.mockReturnValue(['iv', 'cipher', 'tag'])

    await expect(
      initiateUpload('org-1', 'user@example.com', {
        callbackPath: paths.spreadsheetUploadCallback,
        redirectPath: paths.spreadsheetUploaded,
        uploadType: 'create'
      })
    ).rejects.toThrow('connection refused')
  })
})

describe('createCallbackHandler', () => {
  let handler
  let mockH
  let mockBackendApi

  beforeEach(() => {
    handler = createCallbackHandler().handler
    mockBackendApi = { saveSpreadsheet: vi.fn() }
    mockH = { response: vi.fn().mockReturnValue('h-response') }
  })

  test('rejects requests with invalid preSharedKey', async () => {
    const request = {
      payload: { metadata: { preSharedKey: 'wrong-key' } }
    }

    await expect(handler(request, mockH)).rejects.toThrow('Not Allowed')
  })

  test('returns success when no spreadsheets in form', async () => {
    const request = {
      payload: { metadata: { preSharedKey: configuredPreSharedKey } }
    }

    const result = await handler(request, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ message: 'success' })
    expect(result).toBe('h-response')
  })

  test('saves each spreadsheet and returns success', async () => {
    mockBackendApi.saveSpreadsheet.mockResolvedValue({ id: 'saved-1' })

    const request = {
      payload: {
        metadata: {
          preSharedKey: configuredPreSharedKey,
          encryptedEmail: 'enc-email',
          uploadType: 'create'
        },
        form: {
          file1: { fileId: 'f-1' },
          file2: { fileId: 'f-2' }
        }
      },
      backendApi: mockBackendApi,
      params: { organisationId: 'org-99' }
    }

    const result = await handler(request, mockH)

    expect(mockBackendApi.saveSpreadsheet).toHaveBeenCalledTimes(2)
    expect(mockBackendApi.saveSpreadsheet).toHaveBeenCalledWith(
      'org-99',
      'f-1',
      { fileId: 'f-1', encryptedEmail: 'enc-email', uploadType: 'create' }
    )
    expect(mockBackendApi.saveSpreadsheet).toHaveBeenCalledWith(
      'org-99',
      'f-2',
      { fileId: 'f-2', encryptedEmail: 'enc-email', uploadType: 'create' }
    )
    expect(result).toBe('h-response')
  })

  test('throws bad gateway when saveSpreadsheet returns falsy', async () => {
    mockBackendApi.saveSpreadsheet.mockResolvedValue(null)

    const request = {
      payload: {
        metadata: {
          preSharedKey: configuredPreSharedKey
        },
        form: { file1: { fileId: 'f-1' } }
      },
      backendApi: mockBackendApi,
      params: { organisationId: 'org-99' }
    }

    await expect(handler(request, mockH)).rejects.toThrow()
  })

  test('throws when saveSpreadsheet errors', async () => {
    mockBackendApi.saveSpreadsheet.mockRejectedValue(new Error('backend down'))

    const request = {
      payload: {
        metadata: {
          preSharedKey: configuredPreSharedKey
        },
        form: { file1: { fileId: 'f-1' } }
      },
      backendApi: mockBackendApi,
      params: { organisationId: 'org-99' }
    }

    await expect(handler(request, mockH)).rejects.toThrow('backend down')
  })
})
