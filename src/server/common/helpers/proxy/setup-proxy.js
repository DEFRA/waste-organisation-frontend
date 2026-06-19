import http from 'node:http'
import https from 'node:https'
import Wreck from '@hapi/wreck'

import { createLogger } from '../logging/logger.js'
import { config } from '../../../../config/config.js'

const logger = createLogger()

/**
 * If HTTP_PROXY is set setupProxy() will enable it globally
 * for a number of http clients.
 * Node Fetch will still need to pass a ProxyAgent in on each call.
 */
export function setupProxy() {
  const proxyUrl = config.get('httpProxy')

  if (proxyUrl) {
    logger.info('setting up global proxies')

    Wreck.agents.http = http.globalAgent
    Wreck.agents.https = https.globalAgent
  }
}
