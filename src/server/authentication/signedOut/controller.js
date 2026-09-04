import { authentication } from '../content.js'
import { paths } from '../../../config/paths.js'

export const signedOutController = {
  handler(request, h) {
    const pageContent = authentication.signedOut(request)

    return h.view('authentication/signedOut/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      signInButton: pageContent.signInButton,
      startPageUrl: paths.signinDefraIdCallback
    })
  }
}
