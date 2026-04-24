export const privacyNoticeController = {
  handler(_request, h) {
    return h.view('compliance/privacy/index', {
      pageTitle: 'Privacy notice'
    })
  }
}
