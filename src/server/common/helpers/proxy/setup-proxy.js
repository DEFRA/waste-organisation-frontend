import Wreck from '@hapi/wreck'
import { createLogger } from '../logging/logger.js'
import { config } from '../../../../config/config.js'
import Https from 'node:https'
import Http from 'node:http'

const logger = createLogger()

export const setupProxy = () => {
  if (config.get('httpProxy')) {
    logger.info('Routing outbound requests via proxy')
    // Required for Wreck
    Wreck.agents.http = Http.globalAgent
    Wreck.agents.https = Https.globalAgent
  }
  return Wreck
}
