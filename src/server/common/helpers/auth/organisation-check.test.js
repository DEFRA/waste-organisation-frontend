import { JSDOM } from 'jsdom'

import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'
import { statusCodes } from '../../constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { setupAuthedUserSession } from '../../../../test-utils/session-helper.js'

describe('#organisationCheck', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('returns 403 with organisation-required page when authed user has no organisation', async () => {
    const credentials = await setupAuthedUserSession(server)
    delete credentials.currentOrganisationId

    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    const organisationRequiredContent = content.organisationRequired({})
    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.forbidden)
    expect(document.querySelector('h1').textContent).toBe(
      organisationRequiredContent.heading
    )
    expect(payload).toEqual(
      expect.stringContaining(organisationRequiredContent.body)
    )
    expect(payload).toEqual(
      expect.stringContaining(organisationRequiredContent.contactMessage)
    )
    expect(document.querySelector(`a[href="${paths.signOut}"]`)).not.toBeNull()
  })

  test('allows authed user with organisation to continue', async () => {
    const credentials = await setupAuthedUserSession(server)

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.account,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).not.toBe(statusCodes.forbidden)
  })

  test('does not block open routes', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.startPage
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('allows sign-out for authed user without organisation', async () => {
    const credentials = await setupAuthedUserSession(server)
    delete credentials.currentOrganisationId

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.signOut,
      auth: {
        strategy: 'session',
        credentials
      }
    })

    expect(statusCode).not.toBe(statusCodes.forbidden)
  })
})
