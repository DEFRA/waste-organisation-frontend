import http from 'node:http'
import https from 'node:https'
import Wreck from '@hapi/wreck'

import { createLogger } from '../logging/logger.js'
import { config } from '../../../../config/config.js'

const logger = createLogger()

export function setupProxy() {
  const proxyUrl = config.get('httpProxy')

  if (proxyUrl) {
    logger.info('setting up global proxies')

    Wreck.agents.http = http.globalAgent
    Wreck.agents.https = https.globalAgent
  }
}
