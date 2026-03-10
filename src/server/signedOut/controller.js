import { paths } from '../../config/paths.js'

export const signedOutController = {
  handler(_request, h) {
    return h.view('signedOut/index', {
      pageTitle: 'You have been signed out',
      startPageUrl: paths.ukPermit
    })
  }
}
