export const privacyNoticeController = {
  handler(_request, h) {
    return h.view('compliance/privacy/index', {
      pageTitle: 'Waste tracking receipt of waste beta phase privacy notice'
    })
  }
}
