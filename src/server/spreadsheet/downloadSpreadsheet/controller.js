import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { getPaymentStatus } from '../../common/helpers/govpay/paymentStatus.js'
import { spreadsheet } from '../content.js'
import { serviceCharge } from '../../serviceCharge/content.js'

const templateFileUrl = `${config.get('assetPath')}/receipt-of-waste-template.xlsx`

export const downloadSpreadsheetController = {
  async handler(request, h) {
    const { id, currentOrganisationId, currentOrganisationName } =
      request.auth.credentials

    const pageContent = spreadsheet.downloadSpreadsheet(
      request,
      currentOrganisationName
    )

    const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

    let notPaidNotice

    if (isServiceChargeEnabled) {
      const organisation = await request.backendApi.getOrganisation(
        id,
        currentOrganisationId
      )

      const paymentStatus = getPaymentStatus(organisation)

      if (paymentStatus.disabled) {
        notPaidNotice = serviceCharge.notPaidNotice(
          request,
          currentOrganisationName
        )
      }
    }

    return h.view('spreadsheet/downloadSpreadsheet/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      notPaidNotice,
      downloadButton: {
        text: pageContent.downloadButton,
        href: templateFileUrl,
        fileMetadata: pageContent.fileMetadata
      },
      returnLink: {
        text: pageContent.returnLink,
        href: paths.nextAction
      },
      backLink: paths.nextAction
    })
  }
}
