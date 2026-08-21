export const privacyNoticeController = {
  handler(request, h) {
    if (request.locale === 'cy') {
      return h.view('compliance/privacy/index-cy', {
        pageTitle: 'Hysbysiad preifatrwydd'
      })
    }
    return h.view('compliance/privacy/index', {
      pageTitle: 'Privacy notice'
    })
  }
}
