import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import {
  googleTagManagerId,
  googleTagManagerHeadScript
} from '../../helpers/google-tag-manager.js'

/*
 * Acceptance criteria: the Google Tag Manager tag appears in a RoW digital page when the
 * googleAnalytics flag is on, and is absent when it is off. /cookies is a plain page that
 * extends the shared layout, so it stands in for "a RoW digital page".
 */
describe('Google Tag Manager tag on digital service pages', () => {
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

  test('includes the GTM head script and noscript tag when GA is switched on', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    /*
     * Assert the exact inline script is rendered: it is the same string the CSP hash is built
     * from, so if this matches, the browser's script hash will too and the tag won't be blocked.
     */
    expect(payload).toContain(`<script>${googleTagManagerHeadScript}</script>`)
    expect(payload).toContain(`'${googleTagManagerId}'`)
    expect(payload).toContain(
      `https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`
    )
  })

  test('excludes the GTM tags when GA is switched off', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(payload).not.toContain('googletagmanager.com')
  })
})
