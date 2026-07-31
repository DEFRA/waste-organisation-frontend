import { content } from '../../../config/content.js'

export const localAuthorityGuidenceController = {
  async handler(request, h) {
    const pageContent = content.localAuthorityGuidence(request)

    return h.view('onboarding/localAuthorityGuidence/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      steps: pageContent.steps,
      finalNote: pageContent.finalNote,
      link: pageContent.link
    })
  }
}
