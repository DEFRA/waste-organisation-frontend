export const cannotUseServiceController = {
  async handler(_request, h) {
    return h.view('cannotUseService/index', {
      pageTitle: 'Sorry, you cannot use the service',
      heading: 'Sorry, you cannot use the service'
    })
  }
}
