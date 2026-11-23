import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { config } from '../../../config/config.js'

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

  test('allows the GTM and GA4 hosts in each directive when the googleAnalytics flag is on', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const resp = await server.inject({ method: 'GET', url: '/' })
    const directives = Object.fromEntries(
      resp.headers['content-security-policy']
        .split(';')
        .map((directive) => directive.trim().split(/\s+/))
        .map(([name, ...sources]) => [name, sources])
    )

    expect(directives['script-src']).toContain('https://*.googletagmanager.com')
    /* GA4 sends hits to regional hosts (e.g. region1.google-analytics.com), hence wildcards. */
    expect(directives['connect-src']).toEqual(
      expect.arrayContaining([
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.googletagmanager.com'
      ])
    )
    expect(directives['img-src']).toEqual(
      expect.arrayContaining([
        'https://*.google-analytics.com',
        'https://*.googletagmanager.com'
      ])
    )
    expect(directives['frame-src']).not.toContain(
      'https://*.googletagmanager.com'
    )
  })

  test('keeps the strict policy when the googleAnalytics flag is off', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const resp = await server.inject({ method: 'GET', url: '/' })
    const csp = resp.headers['content-security-policy']

    expect(csp).not.toContain('googletagmanager.com')
    expect(csp).not.toContain('google-analytics.com')
  })
})
