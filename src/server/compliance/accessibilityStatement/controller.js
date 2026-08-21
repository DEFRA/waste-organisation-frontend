export const accessibilityStatementController = {
  handler(request, h) {
    if (request.locale === 'cy') {
      return h.view('compliance/accessibilityStatement/index-cy', {
        pageTitle:
          'Datganiad hygyrchedd ar gyfer Rhoi gwybod am dderbyn gwastraff  '
      })
    }

    return h.view('compliance/accessibilityStatement/index', {
      pageTitle: 'Accessibility statement for Report receipt of waste'
    })
  }
}
