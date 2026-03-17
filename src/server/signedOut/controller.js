import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const signedOutController = {
  handler(request, h) {
    const pageContent = content.signedOut(request)

    return h.view('signedOut/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      signInButton: pageContent.signInButton,
      startPageUrl: paths.signinDefraIdCallback
    })
  }
}
