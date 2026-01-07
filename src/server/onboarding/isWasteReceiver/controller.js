import joi from 'joi'
import { paths } from '../../../config/paths.js'
import boom from '@hapi/boom'

export const isWasteReceiverGetController = {
  async handler(request, h) {
    const r = await request.backendApi.getOrganisations(
      request.auth.credentials.id
    )

    const [company] = r.filter(
      (o) => o.organisationId === request?.params?.organisationId
    )

    if (company) {
      const [error] = request.yar.flash('AuthenticationError')

      return h.view('onboarding/isWasteReceiver/index', {
        pageTitle: 'Report receipt of waste',
        question: `Is ${company.name} a waste receiver?`,
        organisationId: company.organisationId,
        action: paths.isWasteReceiver,
        errors: error
      })
    } else {
      throw boom.notFound('Oranisation not found')
    }
  }
}

export const validatePost = {
  validate: {
    payload: joi.object({
      organisationId: joi.string().required(),
      isWasteReceiver: joi
        .string()
        .required()
        .regex(/^(yes|no)$/)
    }),
    failAction: async (request, h) => {
      const [company] = await request.backendApi.getOrganisations(
        request.auth.credentials.id
      )
      request.yar.flash('AuthenticationError', {
        text: 'TODO - get real error msg Please select an option'
      })
      return h
        .view('onboarding/isWasteReceiver/index', {
          pageTitle: 'Report receipt of waste',
          question: `Is ${company.name} a waste receiver?`,
          action: paths.isWasteReceiver,
          errors: { text: 'TODO - get real error msg Please select an option' }
        })
        .takeover()
    }
  }
}

export const isWasteReceiverPostController = {
  async handler(request, h) {
    await request.backendApi.saveOrganisation(
      request.auth.credentials.id,
      request.payload.organisationId,
      {
        isWasteReceiver: request.payload.isWasteReceiver === 'yes'
      }
    )
    return h.redirect(paths.addWasteReceiver)
  }
}
