export const paths = {
  chromeDevtools: '/.well-known/appspecific/com.chrome.devtools.json',
  cookies: '/cookies',

  health: '/health',
  landing: '/',
  dashboard: '/dashboard',
  cannotUseService: '/cannot-use-service',
  accessibility: '/accessibility-statement',
  search: '/search',
  isWasteReceiver: '/onboarding/{organisationId}/is-waste-receiver',
  addWasteReceiver: '/add-waste-receiver',
  noWasteReceiver: '/no-waste-receiver',

  onboarding: '/onboarding',

  signOut: '/sign-out',
  signedOut: '/signed-out',

  signInChoose: '/sign-in',

  signinDefraIdCallback: '/signin-oidc',
  signinEntraIdCallback: '/signin-entra-id'
}

export const pathTo = (route, params) => {
  const routeParams = route.match(/\{\w+\*?\}/g)
  for (const r of routeParams) {
    const parts = r.match(/\{(\w+)\*?\}/)
    const src = params[parts[1]]
    const dst = parts[0]
    const key = parts[1]

    if (src) {
      route = route.replace(dst, src)
    } else {
      throw new Error(
        `Missing key ${key} in route ${route}. Data provided: ${JSON.stringify(params)}`
      )
    }
  }
  return route
}
