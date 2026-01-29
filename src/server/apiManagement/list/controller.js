import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'
import crypto from 'node:crypto'

export const apiManagementController = {
  list: {
    handler(request, h) {
      const scriptNonce = crypto.randomBytes(16).toString('base64')

      request.contentSecurityPolicy = {
        scriptNonce
      }

      const organisationName =
        request?.auth?.credentials?.currentOrganisationName

      const pageContent = content.apiList(request, organisationName)

      return h.view('apiManagement/list/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        backLink: paths.startPage,
        scriptNonce
      })
    }
  }
}
