export const termsController = {
  handler(_request, h) {
    return h.view('terms/index', {
      pageTitle: 'Terms',
      heading: 'Terms',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Terms'
        }
      ]
    })
  }
}
