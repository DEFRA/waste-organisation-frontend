import joi from 'joi'
import { paths } from '../../config/paths.js'

export const addWasteReceiverGetController = {
  async handler(_, h) {
    return h.view('addWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: 'Would you like to add another waste receiver to your account?',
      action: paths.addWasteReceiver,
      errors: null
    })
  }
}

export const validatePost = {
  validate: {
    payload: joi.object({
      addWasteReceiver: joi
        .string()
        .required()
        .regex(/^(yes|no)$/)
    }),
    failAction: async (_, h) => {
      return h
        .view('addWasteReceiver/index', {
          pageTitle: 'Report receipt of waste',
          question:
            'Would you like to add another waste receiver to your account?',
          action: paths.addWasteReceiver,
          errors: { text: 'TODO - get real error msg Please select an option' }
        })
        .takeover()
    }
  }
}

export const addWasteReceiverPostController = {
  async handler(request, h) {
    if (request.payload.addWasteReceiver === 'yes') {
      return h.redirect(paths.search)
    }
    return h.redirect(paths.search)
  }
}
