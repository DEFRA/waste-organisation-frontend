/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const searchController = {
  handler(request, h) {
    console.log('credentials', request.auth.credentials)

    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'You are logged in',
      credentials: JSON.stringify(request.auth.credentials, null, 2)
    })
  }
}
