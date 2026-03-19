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
  downloadSpreadsheet: '/download-spreadsheet',
  accessibility: '/accessibility-statement',
  terms: '/terms',
  privacyNotice: '/privacy-notice',
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

  updateSpreadsheetUpload:
    '/organisation/{organisationId}/update-spreadsheet/begin-upload',
  updateSpreadsheetUploaded:
    '/organisation/{organisationId}/update-spreadsheet/file-uploaded',
  updateSpreadsheetUploadCallback:
    '/organisation/{organisationId}/update-spreadsheet/upload-callback',

  manualEntry: '/organisation/{organisationId}/manual-entry',
  manualEntryAdd: '/organisation/{organisationId}/manual-entry/add',
  manualEntryEdit: '/organisation/{organisationId}/manual-entry/edit/{index}',
  manualEntryDuplicate: '/organisation/{organisationId}/manual-entry/duplicate',
  manualEntryRemove: '/organisation/{organisationId}/manual-entry/remove',
  manualEntryConfirmation:
    '/organisation/{organisationId}/manual-entry/confirmation',

  account: '/account',
  newAccount: '/new-account',
  serviceCharge: '/service-charge',
  reviewPayment: '/review-payment',
  initiatePayment: '/initiate-payment',
  paymentDetails: '/payment-details',
  manageAccount: '/manage-account',

  apiList: '/api',
  apiDisable: '/api/disable/{apiCode}',
  apiCreate: '/api/new',

  testError500: '/test-error/500'
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
