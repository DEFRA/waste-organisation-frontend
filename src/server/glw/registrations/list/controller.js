export const RegistrationListController = {
  handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    return h.view('glw/registrations/list/view', {
      pageTitle: 'Registrations',
      heading: {
        text: 'Registrations',
        organisationName
      }
    })
  }
}
