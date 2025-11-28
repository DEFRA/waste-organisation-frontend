import { createServer } from '../../server.js'
import { config } from '../../../config/config.js'
import plugins from '../../common/plugins/index.js'

async function startServer() {
  const server = await createServer(plugins)
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your frontend on http://localhost:${config.get('port')}`
  )

  return server
}

export { startServer }
