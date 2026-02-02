import Blankie from 'blankie'
import { config } from '../../../config/config.js'
import { createLogger } from './logging/logger.js'
/**
 * Manage content security policies.
 * @satisfies {import('@hapi/hapi').Plugin}
 */

const logger = createLogger()

const contentSecurityPolicy = {
  plugin: Blankie,
  options: (request) => {
    const formAction = ['self']
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

    const scriptSrc = [
      'self',
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"
    ].concat([`'nonce-${request?.contentSecurityPolicy?.scriptNonce}'`])

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
      connectSrc: ['self', 'wss', 'data:'],
      mediaSrc: ['self'],
      styleSrc: ['self'],
      scriptSrc,
      imgSrc: ['self', 'data:'],
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
