import { content } from '../../../../config/content.js'
import { statusCodes } from '../../constants/status-codes.js'

export function organisationCheck(request, h) {
  const currentOrganisationId = request.auth.credentials?.currentOrganisationId

  if (!currentOrganisationId) {
    const pageContent = content.organisationRequired(request)

    return h
      .view('error/organisation-required', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        body: pageContent.body,
        contactMessage: pageContent.contactMessage,
        signOutButton: pageContent.signOutButton,
        signOutUrl: pageContent.signOutUrl
      })
      .takeover()
      .code(statusCodes.forbidden)
  }

  return h.continue
}
