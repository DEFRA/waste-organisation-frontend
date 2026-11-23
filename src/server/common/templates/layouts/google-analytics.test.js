import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { googleTagManagerId } from '../../helpers/google-tag-manager.js'

/*
 * Analytics is consent-gated: nothing loads Google Tag Manager server-side. When the
 * googleAnalytics flag is on, every page renders the cookie banner (hidden until the
 * client script decides to show it) carrying the GTM container id for the client to
 * load once the user accepts. When the flag is off, there is no banner and no GTM at all.
 * /cookies is a plain page that extends the shared layout, so it stands in for any page.
 */
describe('Cookie consent banner on digital service pages', () => {
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

  test('renders the cookie banner carrying the GTM id when GA is switched on', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(payload).toContain('data-module="app-cookie-banner"')
    expect(payload).toContain(`data-gtm-id="${googleTagManagerId}"`)
    expect(payload).toContain('Accept analytics cookies')
    expect(payload).toContain('Reject analytics cookies')
    expect(payload).toContain('Hide cookie message')
    expect(payload).toContain('You’ve accepted analytics cookies')
    expect(payload).toContain('You’ve rejected analytics cookies')
  })

  test('confirmation messages are focusable alerts (GOV.UK cookie-banner guidance)', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    /*
     * Each confirmation message must carry role="alert" and tabindex="-1" so the
     * client script can move focus to it and assistive tech announces the choice.
     */
    const confirmations = payload.match(
      /<div class="govuk-cookie-banner__message[^>]*data-cookie-message="(accepted|rejected)"[^>]*>/g
    )
    expect(confirmations).toHaveLength(2)
    confirmations.forEach((tag) => {
      expect(tag).toContain('role="alert"')
      expect(tag).toContain('tabindex="-1"')
    })
  })

  test('does not load Google Tag Manager server-side', async () => {
    config.set('featureFlags.googleAnalytics', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    /*
     * No inline gtm.js bootstrap and no noscript iframe: both would fire analytics
     * before (or without) consent, so GTM is only ever loaded client-side on accept.
     */
    expect(payload).not.toContain('www.googletagmanager.com/gtm.js')
    expect(payload).not.toContain('www.googletagmanager.com/ns.html')
  })

  test('renders no banner and no GTM when GA is switched off', async () => {
    config.set('featureFlags.googleAnalytics', false)

    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(payload).not.toContain('app-cookie-banner')
    expect(payload).not.toContain('googletagmanager.com')
  })
})
