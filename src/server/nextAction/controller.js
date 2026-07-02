import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths, pathTo } from '../../config/paths.js'
import joi from 'joi'
import { getPaymentStatus } from '../common/helpers/govpay/paymentStatus.js'
const flashMessage = 'isNextActionError'

export const nextActionController = {
  get: {
    async handler(request, h) {
      request.contentSecurityPolicy = {
        extraAuthOrigins: request.authProviderEndpoints
      }

      const { id, currentOrganisationId, currentOrganisationName } =
        request.auth.credentials

      const pageContent = content.nextAction(request, currentOrganisationName)

      const [error] = request.yar.flash(flashMessage)
      let errorContent

      if (error) {
        errorContent = pageContent.error
      }

      let pageQuestions = pageContent.questions

      const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

      let notPaidNotice

      if (isServiceChargeEnabled) {
        const organisation = await request.backendApi.getOrganisation(
          id,
          currentOrganisationId
        )

        const paymentStatus = getPaymentStatus(organisation)

        if (paymentStatus.disabled) {
          pageQuestions = pageContent.questionsNotPaid
          notPaidNotice = content.sharedServiceChargeInfo(
            request,
            currentOrganisationName
          ).notPaidNotice
        }
      }

      const questions = Object.entries(pageQuestions).map((question) => {
        const [key, value] = question
        return {
          value: key,
          text: value,
          id: key,
          attributes: {
            'data-testid': `${key}-radio`
          },
          label: {
            attributes: {
              'data-testid': `${key}-label`
            }
          }
        }
      })

      return h.view('nextAction/view', {
        pageTitle: error ? pageContent.error.pageTitle : pageContent.title,
        heading: pageContent.heading,
        description: pageContent.description,
        link: pageContent.link,
        action: {
          url: paths.nextAction,
          text: pageContent.continueAction
        },
        questions,
        error: errorContent,
        backLink: paths.account,
        notPaidNotice
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: joi.object({
          nextAction: joi.string().required()
        }),
        failAction: (request, h) => {
          request.yar.flash(flashMessage, true)
          return h.redirect(paths.nextAction).takeover()
        }
      }
    },
    handler(request, h) {
      const nextAction = request.payload.nextAction
      const organisationId = request?.auth?.credentials?.currentOrganisationId

      if (nextAction === 'connectYourSoftware') {
        return h.redirect(paths.apiList)
      }

      if (nextAction === 'downloadSpreadsheet') {
        return h.redirect(paths.downloadSpreadsheet)
      }

      if (nextAction === 'uploadSpreadsheet') {
        return h.redirect(pathTo(paths.spreadsheetUpload, { organisationId }))
      }

      if (nextAction === 'updateSpreadsheet') {
        return h.redirect(
          pathTo(paths.updateSpreadsheetUpload, { organisationId })
        )
      }

      if (nextAction === 'changeWasteReceiver') {
        return h.redirect(paths.signinDefraIdCallback)
      }

      request.yar.flash(flashMessage, true)
      return h.redirect(paths.nextAction).takeover()
    }
  }
}
