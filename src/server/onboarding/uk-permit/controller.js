export const ukPermitController = {
  handler(_, h) {
    return h.view('onboarding/uk-permit/view', {
      pageTitle: 'ukPermit',
      heading:
        'Do you operate one or more licensed or permitted waste receiving sites?'
    })
  }
}
