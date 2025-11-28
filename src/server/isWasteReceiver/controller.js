import joi from 'joi'
import { paths } from '../../config/paths.js'

const userId = 'TODO - get from request'

export const isWasteReceiverGetController = {
  async handler(request, h) {
    const [company] = await request.backendApi.getOrganisations(userId)
    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${company.name} a waste receiver?`,
      action: paths.isWasteReceiver,
      errors: null
    })
  }
}

export const validatePost = {
  validate: {
    payload: joi.object({
      isWasteReceiver: joi
        .string()
        .required()
        .regex(/^(yes|no)$/)
    }),
    failAction: async (request, h) => {
      const [company] = await request.backendApi.getOrganisations(userId)
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
    const [company] = await request.backendApi.getOrganisations(userId) // TODO get this from the request or session or something?
    await request.backendApi.saveOrganisation(userId, company.id, {
      isWasteReceiver: request.payload.isWasteReceiver === 'yes'
    })
    return h.redirect(paths.addWasteReceiver)
  }
}
