/* v8 ignore start */
export const paths = {
  chromeDevtools: '/.well-known/appspecific/com.chrome.devtools.json',
  cookies: '/cookies',

  health: '/health',
  startPage: '/start-page',
  dashboard: '/dashboard',
  cannotUseService: '/cannot-use-service',
  ukPermit: '/',
  nextAction: '/next-action',
  accessibility: '/accessibility-statement',
  search: '/search',

  signOut: '/sign-out',
  signedOut: '/signed-out',

  signInChoose: '/sign-in',

  signinDefraIdCallback: '/signin-oidc',
  signinEntraIdCallback: '/signin-entra-id',

  spreadsheetUpload: '/organisation/{organisationId}/spreadsheet/begin-upload',
  spreadsheetUploaded:
    '/organisation/{organisationId}/spreadsheet/file-uploaded',
  spreadsheetUploadCallback:
    '/organisation/{organisationId}/spreadsheet/upload-callback',

  apiList: '/api',
  apiDisable: '/api/disable/{apiCode}',
  apiCreate: '/api/new'
}
/* v8 ignore stop */

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
