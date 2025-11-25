import joi from 'joi'
import { paths } from '../../config/paths.js'

const getCompanyName = () => {
  // TODO get from async process
  return 'Joe Bloggs LTD'
}

export const isWasteReceiverGetController = {
  handler(request, h) {
    const companyName = getCompanyName()
    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${companyName} a waste receiver?`,
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
    failAction: (request, h) => {
      const companyName = getCompanyName()
      return h
        .view('isWasteReceiver/index', {
          pageTitle: 'Report receipt of waste',
          question: `Is ${companyName} a waste receiver?`,
          action: paths.isWasteReceiver,
          errors: { text: 'TODO - get real error msg Please select an option' }
        })
        .takeover()
    }
  }
}

export const isWasteReceiverPostController = {
  handler(request, h) {
    const companyName = getCompanyName()
    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${companyName} a waste receiver?`,
      errors: { text: 'TODO redirect !!' }
    })
  }
}
