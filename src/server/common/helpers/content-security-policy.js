import Blankie from 'blankie'
import { config } from '../../../config/config.js'
import { createLogger } from './logging/logger.js'
import { googleAnalyticsCspSources } from './google-tag-manager.js'

/**
 * Manage content security policies.
 * @satisfies {import('@hapi/hapi').Plugin}
 */

const logger = createLogger()

const contentSecurityPolicy = {
  plugin: Blankie,
  options: (request) => {
    const baseUrl = config.get('appBaseUrl').replace(/\/$/, '')

    const formAction = ['self', baseUrl, `${baseUrl}/`]
      .concat(
        config
          .get('auth.origins')
          .concat(request?.contentSecurityPolicy?.extraAuthOrigins)
      )
      .filter((s) => s)

    if (request?.contentSecurityPolicy?.extraAuthOrigins) {
      logger.info(
        `Updating content security policy: ${request.url} - ${formAction}`
      )
    }

    /*
     * Google Tag Manager is allowed only while the googleAnalytics flag is on, so environments
     * where it's disabled keep the strict policy. The gtm.js script is fetched from the GTM host
     * (no inline snippet), so the host alone is enough in scriptSrc - no script hash is needed.
     * No frameSrc entry: GTM's only frame was the noscript iframe, which consent-gating removed.
     */
    const googleAnalyticsEnabled = config.get('featureFlags.googleAnalytics')
    const gaSources = (directive) =>
      googleAnalyticsEnabled ? googleAnalyticsCspSources[directive] : []

    const scriptSrc = [
      'self',
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"
    ]
      .concat(gaSources('scriptSrc'))
      .concat([`'nonce-${request?.contentSecurityPolicy?.scriptNonce}'`])

    if (request?.contentSecurityPolicy?.scriptNonce) {
      logger.info(
        `Updating content security policy: ${request.url} - ${scriptSrc}`
      )
    }

    return {
      // Hash 'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw=' is to support a GOV.UK frontend script bundled within Nunjucks macros
      // https://frontend.design-system.service.gov.uk/import-javascript/#if-our-inline-javascript-snippet-is-blocked-by-a-content-security-policy
      defaultSrc: ['self'],
      fontSrc: ['self', 'data:'],
      connectSrc: ['self', 'wss', 'data:'].concat(gaSources('connectSrc')),
      mediaSrc: ['self'],
      styleSrc: ['self'],
      scriptSrc,
      imgSrc: ['self', 'data:'].concat(gaSources('imgSrc')),
      frameSrc: ['self', 'data:'],
      objectSrc: ['none'],
      frameAncestors: ['none'],
      formAction,
      manifestSrc: ['self'],
      generateNonces: false
    }
  }
}

export { contentSecurityPolicy }
