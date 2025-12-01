/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const homeController = {
  handler(request, h) {
    if (request.auth.isAuthenticated) {
      return h.redirect('/search')
    }

    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      hideBackLink: true
    })
  }
}
