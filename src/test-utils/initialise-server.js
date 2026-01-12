import { mockOidcConfig } from './mock-oidc-config.js'

export async function initialiseServer({ domain, mockedPlugins, state } = {}) {
  mockOidcConfig(domain)

  const { createServer } = await import('../server/server.js')
  const plugins = await import('../server/common/plugins/index.js')

  const server = await createServer({ ...plugins.default, ...mockedPlugins })

  if (state) {
    await server.ext('onPreAuth', (request, h) => {
      request.yar.flash(state.type, state.message)
      return h.continue
    })
  }

  await server.initialize()

  return server
}
