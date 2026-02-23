import path from 'node:path'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const templateFilePath = path.resolve(
  import.meta.dirname,
  'receipt-of-waste-template.xlsx'
)

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
          href: paths.downloadSpreadsheetFile
        },
        returnLink: {
          text: pageContent.returnLink,
          href: paths.nextAction
        },
        backLink: paths.nextAction
      })
    }
  },
  download: {
    handler(_request, h) {
      return h
        .file(templateFilePath, { confine: false })
        .header(
          'Content-Disposition',
          'attachment; filename="receipt-of-waste-template.xlsx"'
        )
        .header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    }
  }
}
