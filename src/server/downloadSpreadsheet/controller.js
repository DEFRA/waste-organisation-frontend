import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const templateFileUrl = '/public/receipt-of-waste-template.xlsx'

export const downloadSpreadsheetController = {
  get: {
    handler(request, h) {
      const organisationName =
        request?.auth?.credentials?.currentOrganisationName

      const pageContent = content.downloadSpreadsheet(request, organisationName)

      return h.view('downloadSpreadsheet/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        body: pageContent.body,
        downloadButton: {
          text: pageContent.downloadButton,
          href: templateFileUrl
        },
        returnLink: {
          text: pageContent.returnLink,
          href: paths.nextAction
        },
        backLink: paths.nextAction
      })
    }
  }
}
