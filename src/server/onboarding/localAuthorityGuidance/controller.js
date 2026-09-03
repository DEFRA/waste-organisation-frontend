import { onboarding } from '../content.js'
import { paths } from '../../../config/paths.js'

export const localAuthorityGuidanceController = {
  async handler(request, h) {
    const pageContent = onboarding.localAuthorityGuidance(request)

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
