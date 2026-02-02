import { beforeAll, afterAll, describe, expect } from 'vitest'
import {
  initialiseServer,
  wreckPostMock,
  wreckPutMock
} from '../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../config/paths.js'
import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
// import { preSharedKey } from './controller.js'

describe('spreadsheet upload controller', () => {
  let server
  let preSharedKey

  beforeAll(async () => {
    server = await initialiseServer()
    preSharedKey = require('./controller.js').preSharedKey
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('begin upload renders', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'abc-123'

    wreckPostMock.mockReturnValue({
      payload: { uploadUrl: 'http://example.com/test' }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: pathTo(paths.spreadsheetUpload, {
        organisationId: credentials.currentOrganisationId
      }),
      auth: {
        strategy: 'session',
        credentials
      }
    })
    const { document } = new JSDOM(payload).window
    expect(statusCode).toBe(200)
    const form = document.querySelectorAll('form')[0]
    expect(form.action).toEqual('http://example.com/test')
  })

  test('file uploaded page renders', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'abc-123'

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: pathTo(paths.spreadsheetUploaded, {
        organisationId: credentials.currentOrganisationId
      }),
      auth: {
        strategy: 'session',
        credentials
      }
    })
    const { document } = new JSDOM(payload).window
    expect(statusCode).toBe(200)
    const heading = document.querySelectorAll('.govuk-heading-l')[0].textContent
    expect(heading).toEqual(expect.stringContaining('Upload'))
  })

  test('callback', async () => {
    wreckPutMock.mockReturnValue({
      payload: { message: 'success', spreadsheet: {} }
    })

    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: pathTo(paths.spreadsheetUploadCallback, {
        organisationId: 'abc-321'
      }),
      payload: {
        metadata: { preSharedKey },
        form: { thing: { fileId: '123' } }
      }
    })
    expect(statusCode).toBe(200)
    expect(JSON.parse(payload)).toEqual({ message: 'success' })
  })

  test('callback ignores missing spreadsheets', async () => {
    wreckPutMock.mockReturnValue({
      payload: { message: 'success', spreadsheet: {} }
    })

    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: pathTo(paths.spreadsheetUploadCallback, {
        organisationId: 'abc-321'
      }),
      payload: { metadata: { preSharedKey } }
    })
    expect(statusCode).toBe(200)
    expect(JSON.parse(payload)).toEqual({ message: 'success' })
  })

  test('callback rejects invalid auth token', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: pathTo(paths.spreadsheetUploadCallback, {
        organisationId: 'abc-321'
      }),
      payload: { metadata: { preSharedKey: 'fish' } }
    })
    expect(statusCode).toBe(403)
  })

  test('callback retries callback in event of error', async () => {
    wreckPutMock.mockImplementation(async () => {
      throw Error()
    })

    const { statusCode } = await server.inject({
      method: 'POST',
      url: pathTo(paths.spreadsheetUploadCallback, {
        organisationId: 'abc-321'
      }),
      payload: {
        metadata: { preSharedKey },
        form: { thing: { fileId: '123' } }
      }
    })
    expect(statusCode).toBe(502)
  })

  test('callback retries callback when no data', async () => {
    wreckPutMock.mockReturnValue({ payload: { message: 'success' } })
    const { statusCode } = await server.inject({
      method: 'POST',
      url: pathTo(paths.spreadsheetUploadCallback, {
        organisationId: 'abc-321'
      }),
      payload: {
        metadata: { preSharedKey },
        form: { thing: { fileId: '123' } }
      }
    })
    expect(statusCode).toBe(502)
  })
})
