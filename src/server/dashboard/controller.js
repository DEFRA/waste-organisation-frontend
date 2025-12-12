export const dashboardController = {
  async handler(_request, h) {
    return h.view('dashboard/index', {
      pageTitle: 'Dashboard',
      heading: 'Dashboard'
    })
  }
}
