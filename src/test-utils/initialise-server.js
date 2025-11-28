import { mockOidcConfig } from './mock-oidc-config.js'

export async function initialiseServer({ domain, mockedPlugins } = {}) {
  mockOidcConfig(domain)

  const { createServer } = await import('../server/server.js')
  const plugins = await import('../server/common/plugins/index.js')

  const server = await createServer({ ...plugins.default, ...mockedPlugins })

  await server.initialize()

  return server
}
