export const termsController = {
  handler(request, h) {
    if (request.locale === 'cy') {
      return h.view('compliance/terms/index-cy', {
        pageTitle: 'Telerau'
      })
    }
    return h.view('compliance/terms/index', {
      pageTitle: 'Terms'
    })
  }
}
