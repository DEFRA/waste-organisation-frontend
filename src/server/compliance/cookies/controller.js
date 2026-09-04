export const cookiesController = {
  handler(request, h) {
    if (request.locale === 'cy') {
      return h.view('compliance/cookies/index-cy', {
        pageTitle: 'Cwcis'
      })
    }

    return h.view('compliance/cookies/index', {
      pageTitle: 'Cookies'
    })
  }
}
