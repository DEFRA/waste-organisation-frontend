import joi from 'joi'
import { paths } from '../../config/paths.js'

const getCompany = (apiService, userId) => {
  // TODO get from async process
  return { name: 'Joe Bloggs LTD', id: '8e4f7ffb-1936-4ca5-8f82-5be929e0de1b' }
}

const saveCompany = (companyId, isWasteReceiver) => {
  return { id: companyId, isWasteReceiver: isWasteReceiver === 'yes' }
}

const userId = 'TODO - get from request'

export const isWasteReceiverGetController = {
  handler(request, h) {
    const company = getCompany(userId)
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
    failAction: (request, h) => {
      const company = getCompany(userId)
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
  handler(request, h) {
    const company = getCompany(userId)
    saveCompany(company.id, request.payload.isWasteReceiver)
    return h.redirect('/TODO-next-page')
  }
}
