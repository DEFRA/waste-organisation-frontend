import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { config } from '../../../config/config.js'
import { googleTagManagerScriptHash } from './google-tag-manager.js'

describe('#contentSecurityPolicy', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  afterEach(() => {
    config.set('featureFlags.googleAnalytics', false)
  })

  test('Should set the CSP policy header', async () => {
    const resp = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(resp.headers['content-security-policy']).toBeDefined()
  })

  test('allows Google Tag Manager when the googleAnalytics flag is on', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const resp = await server.inject({ method: 'GET', url: '/' })
    const csp = resp.headers['content-security-policy']

    expect(csp).toContain('https://www.googletagmanager.com')
    expect(csp).toContain(googleTagManagerScriptHash)
  })

  test('keeps the strict policy when the googleAnalytics flag is off', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const resp = await server.inject({ method: 'GET', url: '/' })
    const csp = resp.headers['content-security-policy']

    expect(csp).not.toContain('googletagmanager.com')
    expect(csp).not.toContain(googleTagManagerScriptHash)
  })
})
