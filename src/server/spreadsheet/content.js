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
      },
      cy: {
        title: 'Uwchlwytho taenlen symudiadau derbyn gwastraff',
        heading: heading(
          'Uwchlwytho taenlen symudiadau derbyn gwastraff',
          null,
          organisationName
        ),
        continueAction: 'Uwchlwytho'
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
      },
      cy: {
        title: "Taenlen wedi'i huwchlwytho",
        heading: heading("Taenlen wedi'i huwchlwytho", null, null),
        content: {
          heading: 'Beth fydd yn digwydd nesaf',
          text: [
            "Byddwn ni'n edrych ar eich taenlen am firysau a gwallau.",
            "Byddwch chi wedyn yn cael e-bost yn cadarnhau a yw'r daenlen wedi cael ei derbyn neu ei gwrthod."
          ],
          referenceText: 'Cyfeirnod y daenlen:'
        },
        returnLink: `Dychwelyd i ${organisationName}`
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
      },
      cy: {
        title: "Diweddaru taenlen sy'n bodoli'n barod",
        heading: heading(
          "Diweddaru taenlen sy'n bodoli'n barod",
          null,
          organisationName
        ),
        description:
          "Dim ond os ydych chi wedi cael ID Tracio Gwastraff ar gyfer y symudiad gwastraff hwnnw y byddwch chi'n gallu diweddaru taenlen sy'n bodoli'n barod.",
        continueAction: 'Parhau'
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
      },
      cy: {
        title: 'Lawrlwytho taenlen Derbyn gwastraff',
        heading: heading(
          'Lawrlwytho taenlen Derbyn gwastraff',
          null,
          organisationName
        ),
        body: "Os nad oes gennych y feddalwedd sydd arnoch ei hangen i ddefnyddio'r API, lawrlwythwch y daenlen i roi gwybod am eich gwastraff.",
        downloadButton: "Lawrlwytho'r daenlen",
        fileMetadata: 'XLSX, 428KB',
        returnLink: `Dychwelyd i ${organisationName}`
      }
    })
}
