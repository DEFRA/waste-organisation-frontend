import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const localAuthorityGuidanceController = {
  async handler(request, h) {
    const pageContent = content.localAuthorityGuidance(request)

    return h.view('onboarding/localAuthorityGuidance/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      steps: pageContent.steps,
      finalNote: pageContent.finalNote,
      link: pageContent.link,
      backLink: paths.ukPermit
    })
  }
}
