import { expect, test, vi } from 'vitest'
import {
  initialiseServer,
  wreckPutMock,
  wreckGetMock
} from '../../../test-utils/initialise-server'
import { paths, pathTo } from '../../../config/paths'
import { JSDOM } from 'jsdom'
import { content } from '../../../config/content'
import { faker } from '@faker-js/faker'
import { setupAuthedUserSession } from '../../../test-utils/session-helper'
import { apiChangeNameController } from './controller'

const organisationName = 'ORG NAME'
const organisationId = 'ORG ID'

describe('apiChangeName', () => {
  let server
  let credentials
  const pageContent = content.apiChangeName({}, 'OrgName')

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(async () => {
    credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
    credentials.currentOrganisationId = organisationId
  })

  describe('GET', () => {
    test('should render the correct content on the page', async () => {
      const apiCode = faker.string.uuid()
      const apiCodeName = 'My API Code'
      wreckGetMock.mockReturnValue({
        payload: { apiCodes: [{ code: apiCode, name: apiCodeName }] }
      })

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiChangeName, { apiCode }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      expect(document.title).toEqual(
        expect.stringContaining(`${pageContent.title} |`)
      )

      const label = document.querySelector('label[for="name"]')
      expect(label.textContent).toEqual(
        expect.stringContaining(pageContent.heading.text)
      )

      const input = document.querySelector('#name')
      expect(input.getAttribute('value')).toBe(apiCodeName)

      const hint = document.querySelector('#name-hint')
      expect(hint.textContent).toEqual(
        expect.stringContaining(pageContent.hint)
      )
    })

    test('should return 500 if backend fails to load api codes', async () => {
      const apiCode = faker.string.uuid()
      wreckGetMock.mockReturnValue({
        payload: {}
      })

      const response = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiChangeName, { apiCode }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(response.statusCode).toEqual(500)
    })

    test('should show 404 page if the api code is not found', async () => {
      const apiCode = faker.string.uuid()
      const differentApiCode = faker.string.uuid()
      wreckGetMock.mockReturnValue({
        payload: { apiCodes: [{ code: differentApiCode }] }
      })

      const response = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiChangeName, { apiCode }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(response.statusCode).toEqual(404)
    })

    test('should show error message if there is an error', async () => {
      const apiCode = faker.string.uuid()
      wreckGetMock.mockReturnValue({
        payload: { apiCodes: [{ code: apiCode, name: 'Test' }] }
      })
      const expectedErrorMessage = pageContent.error.message
      server.injectYarState({ type: 'changeNameError', message: 'validation' })

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiChangeName, { apiCode }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      const errorMessage = document.querySelectorAll(
        '.govuk-error-summary__body ul li'
      )[0].textContent

      expect(errorMessage).toEqual(
        expect.stringContaining(expectedErrorMessage)
      )
    })

    test('should show update error message when backend update fails', async () => {
      const apiCode = faker.string.uuid()
      let actualOptions

      const request = {
        auth: {
          credentials: {
            currentOrganisationId: organisationId,
            currentOrganisationName: organisationName
          }
        },
        params: { apiCode },
        backendApi: {
          getApiCodes: () => [{ code: apiCode, name: 'Test' }]
        },
        yar: {
          flash: vi.fn().mockReturnValue(['update'])
        }
      }

      const h = {
        view: (_path, options) => {
          actualOptions = options
        }
      }

      await apiChangeNameController.get.handler(request, h)

      expect(actualOptions.error.message).toBe(pageContent.updateError.message)
      expect(actualOptions.pageTitle).toEqual(
        expect.stringContaining(pageContent.errorPrefix)
      )
    })

    test('should prefix page title with Error when there is a validation error', async () => {
      const apiCode = faker.string.uuid()
      wreckGetMock.mockReturnValue({
        payload: { apiCodes: [{ code: apiCode, name: 'Test' }] }
      })
      server.injectYarState({ type: 'changeNameError', message: 'validation' })

      const { payload } = await server.inject({
        method: 'GET',
        url: pathTo(paths.apiChangeName, { apiCode }),
        auth: {
          strategy: 'session',
          credentials
        }
      })

      const { document } = new JSDOM(payload).window

      expect(document.title).toEqual(
        expect.stringContaining(`Error: ${pageContent.title} |`)
      )
    })
  })

  describe('POST', () => {
    test('should redirect to api list and call update when valid name provided', async () => {
      const apiCode = faker.string.uuid()
      const { headers } = await server.inject({
        method: 'POST',
        url: pathTo(paths.apiChangeName, { apiCode }),
        payload: {
          name: 'New API Name'
        },
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(headers.location).toBe(paths.apiList)
      expect(wreckPutMock).toHaveBeenCalled()
    })

    test('should redirect back with error when backend update fails', async () => {
      const apiCode = faker.string.uuid()
      wreckPutMock.mockReturnValue(null)

      const { headers } = await server.inject({
        method: 'POST',
        url: pathTo(paths.apiChangeName, { apiCode }),
        payload: {
          name: 'New API Name'
        },
        auth: {
          strategy: 'session',
          credentials
        }
      })

      expect(headers.location).toBe(pathTo(paths.apiChangeName, { apiCode }))
    })

    test.each([{}, { payload: {} }, { payload: { name: '' } }])(
      'should redirect to get endpoint if name is empty or missing',
      async (payloadData) => {
        const apiCode = faker.string.uuid()

        const { headers } = await server.inject({
          method: 'POST',
          url: pathTo(paths.apiChangeName, { apiCode }),
          auth: {
            strategy: 'session',
            credentials
          },
          ...payloadData
        })

        expect(headers.location).toBe(pathTo(paths.apiChangeName, { apiCode }))
      }
    )
  })
})
