export const accessibilityStatementController = {
  handler(_request, h) {
    return h.view('compliance/accessibilityStatement/index', {
      pageTitle: 'Accessibility statement for Report receipt of waste'
    })
  }
}
