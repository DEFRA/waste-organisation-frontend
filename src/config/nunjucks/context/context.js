import path from 'node:path'
import { readFileSync } from 'node:fs'

import { config } from '../../config.js'
import { content } from '../../content.js'
import { languageToggleHref } from '../../../server/common/plugins/translations/language-toggle-href.js'
import { buildNavigation } from './build-navigation.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'

const logger = createLogger()
const assetPath = config.get('assetPath')
const manifestPath = path.join(
  config.get('root'),
  '.public/assets-manifest.json'
)

let webpackManifest

export function context(request) {
  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch (error) {
      logger.error(`Webpack ${path.basename(manifestPath)} not found`)
    }
  }

  return {
    assetPath: `${assetPath}/assets`,
    serviceName:
      request.locale === 'cy'
        ? config.get('serviceNameCY')
        : config.get('serviceName'),
    serviceUrl: config.get('links.account'),
    feedbackUrl: config.get('links.feedback'),
    layout: content.layout(request),
    languageToggle: {
      locale: request.locale === 'cy' ? 'cy' : 'en',
      englishHref: languageToggleHref(request, 'en'),
      welshHref: languageToggleHref(request, 'cy')
    },
    breadcrumbs: [],
    navigation: buildNavigation(request),
    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      return `${assetPath}/${webpackAssetPath ?? asset}`
    }
  }
}
