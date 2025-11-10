import { mockOidcConfig } from './mock-oidc-config.js'

export async function initialiseServer({ domain } = {}) {
  mockOidcConfig(domain)

  const { createServer } = await import('../server/server.js')

  const server = await createServer()

  await server.initialize()

  return server
}
