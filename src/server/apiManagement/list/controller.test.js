import { expect, test, vi } from 'vitest'
import {
  wreckGetMock,
  initialiseServer
} from '../../../test-utils/initialise-server'
import { paths } from '../../../config/paths'
import { JSDOM } from 'jsdom'
import { content } from '../../../config/content'
import { apiManagementController } from './controller'
import { setupAuthedUserSession } from '../../../test-utils/session-helper'

describe('apiList', () => {
  let server
  const pageContent = content.apiList(null, 'Joe Bloggs Ltd')

  const organisationName = 'ORG NAME'
  const organisationId = 'ORG Id'

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('should render the correct content on the page', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
    credentials.currentOrganisationId = organisationId

    const expectedApiCodes = [
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 1',
        isDisabled: false
      }
    ]

    wreckGetMock.mockReturnValue({
      payload: { apiCodes: expectedApiCodes }
    })

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.apiList,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    const pageOrgName = document.querySelectorAll(
      '[data-testid="app-heading-organisation-name"]'
    )[0].textContent

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )

    expect(pageOrgName).toEqual(expect.stringContaining(organisationName))
  })

  test('should render all enabled api codes', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
    credentials.currentOrganisationId = organisationId

    const expectedApiCodes = [
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 1',
        isDisabled: false
      },
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 2',
        isDisabled: false
      }
    ]

    wreckGetMock.mockReturnValue({
      payload: { apiCodes: expectedApiCodes }
    })

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.apiList,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const summaryList = document.querySelectorAll(
      '[data-testid="app-api-summary-list"]'
    )[0]

    expect(summaryList.children.length).toEqual(4)

    const summaryListNoItems = document.querySelectorAll(
      '[data-testid="app-api-summary-list-no-items"]'
    )

    expect(summaryListNoItems.length).toEqual(0)
  })

  test('should not render api codes if all disabled', async () => {
    const credentials = await setupAuthedUserSession(server)
    credentials.currentOrganisationName = organisationName
    credentials.currentOrganisationId = organisationId

    const expectedApiCodes = [
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 1',
        isDisabled: true
      },
      {
        code: 'f81e62f4-3875-488f-bbe3-3cb0be5fde5b',
        name: 'API Code 2',
        isDisabled: true
      }
    ]

    wreckGetMock.mockReturnValue({
      payload: { apiCodes: expectedApiCodes }
    })

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.apiList,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const { document } = new JSDOM(payload).window

    const summaryListNoItems = document.querySelectorAll(
      '[data-testid="app-api-summary-list-no-items"]'
    )[0].textContent

    expect(summaryListNoItems).toEqual(pageContent.noEnabledApiCodes)

    const summaryList = document.querySelectorAll(
      '[data-testid="app-api-summary-list"]'
    )

    expect(summaryList.length).toEqual(0)
  })

  test('should send apiCode rows to view correctly', async () => {
    let actualPath
    let actualOptions

    const request = {
      yar: {
        flash: vi.fn().mockImplementation(() => ['something'])
      },
      contentSecurityPolicy: {},
      auth: {
        credentials: {
          currentOrganisationId: organisationId
        }
      },
      backendApi: {
        getApiCodes: () => [
          {
            code: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4',
            name: 'Joe Bloggs LTD_code_1',
            isDisabled: false
          },
          {
            code: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4',
            name: 'Joe Bloggs LTD_code_2',
            isDisabled: false
          }
        ]
      }
    }

    const handler = {
      view: (path, options) => {
        actualPath = path
        actualOptions = options
      }
    }

    await apiManagementController.list.handler(request, handler)

    expect(actualPath).toBe('apiManagement/list/view')
    expect(actualOptions.apiCodeRows).toEqual([
      {
        key: {
          classes: '',
          text: 'API code 1'
        },
        value: {
          text: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4'
        },
        actions: {
          items: [
            {
              href: '/api/disable/d05d0c78-c0c4-457c-8161-67a88c0f9ba4',
              text: 'Disable',
              classes: 'govuk-button govuk-button--secondary',
              attributes: {
                'data-copyText': 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4'
              }
            }
          ]
        }
      },
      {
        key: {
          classes: 'govuk-!-padding-bottom-6 govuk-!-padding-top-6',
          text: 'Name'
        },
        value: {
          text: 'Joe Bloggs LTD_code_1'
        }
      },
      {
        key: {
          classes: 'govuk-!-padding-top-6',
          text: 'API code 2'
        },
        value: {
          text: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4'
        },
        actions: {
          items: [
            {
              href: '/api/disable/d05d0c78-c0c4-457c-8161-67a88c0f9ba4',
              text: 'Disable',
              classes: 'govuk-button govuk-button--secondary',
              attributes: {
                'data-copyText': 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4'
              }
            }
          ]
        }
      },
      {
        key: {
          classes: ' govuk-!-padding-top-6',
          text: 'Name'
        },
        value: {
          text: 'Joe Bloggs LTD_code_2'
        }
      }
    ])
  })

  test('should create apiCode if none exist', async () => {
    const request = {
      yar: {
        flash: vi.fn().mockImplementation(() => ['something'])
      },
      contentSecurityPolicy: {},
      auth: {
        credentials: {
          currentOrganisationId: organisationId
        }
      },
      backendApi: {
        getApiCodes: () => null,
        createApiCodes: vi.fn().mockImplementation(async () => ({
          code: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4',
          name: 'Joe Bloggs LTD_code_2',
          isDisabled: false
        }))
      }
    }

    const handler = {
      view: () => vi.fn()
    }

    await apiManagementController.list.handler(request, handler)

    expect(request.backendApi.createApiCodes).toHaveBeenCalled()
  })

  test('should create apiCode when requested', async () => {
    const request = {
      contentSecurityPolicy: {},
      auth: {
        credentials: {
          currentOrganisationId: organisationId
        }
      },
      backendApi: {
        createApiCodes: vi.fn().mockImplementation(async () => ({
          code: 'd05d0c78-c0c4-457c-8161-67a88c0f9ba4',
          name: 'Joe Bloggs LTD_code_2',
          isDisabled: false
        }))
      }
    }
    const handler = {
      redirect: (url) => ({ takeover: () => ({ myTestRedirect: url }) })
    }

    const result = await apiManagementController.create.handler(
      request,
      handler
    )
    expect(request.backendApi.createApiCodes).toHaveBeenCalled()
    expect(result).toEqual({ myTestRedirect: paths.apiList })
  })
})
