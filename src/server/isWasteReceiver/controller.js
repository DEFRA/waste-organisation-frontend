/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const isWasteReceiverController = {
  handler(request, h) {
    const companyName = 'Joe Bloggs LTD'
    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${companyName} a waste receiver?`
    })
  }
}
