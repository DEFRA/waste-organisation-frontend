export const privacyNoticeController = {
  handler(_request, h) {
    return h.view('privacy/index', {
      pageTitle: 'Privacy notice'
    })
  }
}
