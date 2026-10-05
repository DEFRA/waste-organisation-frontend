export const RegistrationQuestionsController = {
  handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    return h.view('glw/registrations/questions/view', {
      pageTitle: 'Registration Questions',
      heading: {
        text: 'Registration Questions',
        organisationName
      }
    })
  }
}
