import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths, pathTo } from '../../config/paths.js'

const paymentStatusFlash = 'paymentStatus'
const paymentStatusSuccess = 'success'
const serviceChargeStatusKey = 'serviceChargeStatus'
const serviceChargeStatusPaid = 'paid'

export const newAccountController = {
  handler(request, h) {
    if (!config.get('featureFlags.newAccountPage')) {
      throw boom.notFound()
    }

    const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')
    const isUpdateSpreadsheetEnabled = config.get(
      'featureFlags.updateSpreadsheet'
    )

    const organisationName = request?.auth?.credentials?.currentOrganisationName
    const organisationId = request?.auth?.credentials?.currentOrganisationId

    const pageContent = content.newAccount(request, organisationName)
    const [paymentStatus] = request.yar.flash(paymentStatusFlash)

    if (
      isServiceChargeEnabled &&
      paymentStatus === paymentStatusSuccess &&
      organisationId
    ) {
      const existingStatusByOrg = request.yar.get(serviceChargeStatusKey) || {}
      existingStatusByOrg[organisationId] = serviceChargeStatusPaid
      request.yar.set(serviceChargeStatusKey, existingStatusByOrg)
    }

    const serviceChargeStatusByOrg =
      request.yar.get(serviceChargeStatusKey) || {}
    const isServiceChargePaid =
      isServiceChargeEnabled &&
      organisationId &&
      serviceChargeStatusByOrg[organisationId] === serviceChargeStatusPaid

    const linkPaths = {
      connectYourSoftware: paths.apiList,
      downloadSpreadsheet: paths.downloadSpreadsheet,
      ...(organisationId && {
        uploadSpreadsheet: pathTo(paths.spreadsheetUpload, { organisationId }),
        updateSpreadsheet: pathTo(paths.updateSpreadsheetUpload, {
          organisationId
        })
      })
    }

    const requiresOrganisation = new Set([
      'uploadSpreadsheet',
      'updateSpreadsheet'
    ])

    const reportWasteLinks = Object.entries(pageContent.cards.reportWaste.links)
      .filter(
        ([key]) => key !== 'updateSpreadsheet' || isUpdateSpreadsheetEnabled
      )
      .filter(([key]) => !requiresOrganisation.has(key) || organisationId)
      .map(([key, text]) => ({
        text,
        href: linkPaths[key],
        testId: `report-waste-${key}-link`
      }))

    return h.view('newAccount/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      switchOrganisation: pageContent.switchOrganisation,
      importantNotice: pageContent.importantNotice,
      cards: pageContent.cards,
      isServiceChargeEnabled,
      isServiceChargePaid,
      switchOrganisationHref: paths.signinDefraIdCallback,
      serviceChargeHref: paths.serviceCharge,
      apiListHref: paths.apiList,
      reportWasteLinks
    })
  }
}
