import { getContentForLanguage, heading } from '../../config/content.js'

export const spreadsheet = {
  spreadsheetUpload: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Upload a receipt of waste movement spreadsheet',
        heading: heading(
          'Upload a receipt of waste movement spreadsheet',
          null,
          organisationName
        ),
        continueAction: 'Upload'
      }
    }),
  spreadsheetUploaded: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Spreadsheet uploaded',
        heading: heading('Spreadsheet uploaded', null, null),
        content: {
          heading: 'What happens next',
          text: [
            'We will check your spreadsheet for viruses and errors.',
            'You will then receive an email confirming whether the spreadsheet has been accepted or rejected.'
          ],
          referenceText: 'Spreadsheet reference:'
        },
        returnLink: `Return to ${organisationName}`
      }
    }),
  updateSpreadsheetUpload: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Update an existing spreadsheet',
        heading: heading(
          'Update an existing spreadsheet',
          null,
          organisationName
        ),
        description:
          'You will only be able to update an existing spreadsheet if you have been given a Waste Tracking ID for that waste movement.',
        continueAction: 'Continue'
      }
    }),
  downloadSpreadsheet: (request, organisationName) =>
    getContentForLanguage(request, {
      en: {
        title: 'Download Receipt of waste spreadsheet',
        heading: heading(
          'Download Receipt of waste spreadsheet',
          null,
          organisationName
        ),
        body: 'If you do not have the software needed to use the API, download the spreadsheet to report your waste.',
        downloadButton: 'Download spreadsheet',
        fileMetadata: 'XLSX, 428KB',
        returnLink: `Return to ${organisationName}`
      }
    })
}
