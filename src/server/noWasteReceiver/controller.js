export const noWasteReceiverController = {
  async handler(_, h) {
    return h.view('noWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      hideBackLink: true
    })
  }
}
