import joi from 'joi'
import { paths } from '../../config/paths.js'

export const isWasteReceiverGetController = {
  async handler(request, h) {
    // TODO fix this ...
    const [company] = await request.backendApi.getOrganisations(
      request.auth.credentials.id
    )
    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${company.name} a waste receiver?`,
      organisationId: company.organisationId,
      action: paths.isWasteReceiver,
      errors: null
    })
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
      return h
        .view('isWasteReceiver/index', {
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
