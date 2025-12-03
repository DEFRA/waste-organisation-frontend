import { paths } from '../../config/paths.js'

const userId = 'TODO - get from request'

export const onboardingGetController = {
  async handler(request, h) {
    console.log(h)

    const [company] = await request.backendApi.getOrganisations(userId)

    console.log(request.query?.organsiationId)

    if (!request.query?.organsiationId) {
      return h.redirect(`${paths.onboarding}?organsiationId=${company.id}`)
    }

    return h.view('isWasteReceiver/index', {
      pageTitle: 'Report receipt of waste',
      question: `Is ${company.name} a waste receiver?`,
      action: paths.isWasteReceiver,
      errors: null
    })
  }
}
