import { content } from '../../../../config/content.js'
import { statusCodes } from '../../constants/status-codes.js'

export function renderOrganisationRequired(request, h) {
  const pageContent = content.organisationRequired(request)

  return h
    .view('error/organisation-required', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      contactMessage: pageContent.contactMessage,
      startPageLinkText: pageContent.startPageLinkText,
      startPageUrl: pageContent.startPageUrl
    })
    .code(statusCodes.forbidden)
}

export function organisationCheck(request, h) {
  const currentOrganisationId = request.auth.credentials?.currentOrganisationId

  if (!currentOrganisationId) {
    return renderOrganisationRequired(request, h).takeover()
  }

  return h.continue
}
