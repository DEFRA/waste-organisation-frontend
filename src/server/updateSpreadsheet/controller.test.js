import { beforeAll, afterAll, describe, expect } from 'vitest'
import {
  initialiseServer,
  wreckPostMock,
  wreckPutMock
} from '../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../config/paths.js'
import { JSDOM } from 'jsdom'
import { setupAuthedUserSession } from '../../test-utils/session-helper.js'
import { content } from '../../config/content.js'

describe('update spreadsheet upload controller', () => {
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
      url: pathTo(paths.updateSpreadsheetUpload, {
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

  test('upload file input is required', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'abc-123'

    wreckPostMock.mockReturnValue({
      payload: { uploadUrl: 'http://example.com/test' }
    })

    const { payload } = await server.inject({
      method: 'GET',
      url: pathTo(paths.updateSpreadsheetUpload, {
        organisationId: credentials.currentOrganisationId
      }),
      auth: {
        strategy: 'session',
        credentials
      }
    })
    const { document } = new JSDOM(payload).window
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput.hasAttribute('required')).toBe(true)
  })

  test('begin upload defaults to initiate domain when upload not provided', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'abc-123'

    wreckPostMock.mockReturnValue({
      payload: { uploadUrl: '/test' }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: pathTo(paths.updateSpreadsheetUpload, {
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
    expect(form.action).toEqual('/test')
  })

  test('file uploaded page renders', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationId = 'abc-123'

    const pageContent = content.updateSpreadsheetUploaded({}, 'Joe Bloggs Ltd')

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: pathTo(paths.updateSpreadsheetUploaded, {
        organisationId: credentials.currentOrganisationId
      }),
      auth: {
        strategy: 'session',
        credentials
      }
    })
    const { document } = new JSDOM(payload).window
    expect(statusCode).toBe(200)
    const heading = document.querySelectorAll('h1.govuk-panel__title')[0]
      .textContent
    expect(heading).toEqual(expect.stringContaining(pageContent.heading.text))
  })

  test('callback does not require session auth', async () => {
    wreckPutMock.mockReturnValue({
      payload: { message: 'success', spreadsheet: {} }
    })

    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: pathTo(paths.updateSpreadsheetUploadCallback, {
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
      url: pathTo(paths.updateSpreadsheetUploadCallback, {
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
      url: pathTo(paths.updateSpreadsheetUploadCallback, {
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
      url: pathTo(paths.updateSpreadsheetUploadCallback, {
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
      url: pathTo(paths.updateSpreadsheetUploadCallback, {
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
