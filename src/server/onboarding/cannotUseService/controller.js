import { content } from '../../../config/content.js'

export const cannotUseServiceController = {
  async handler(_request, h) {
    const pageContent = content.cannotUseService()

    return h.view('onboarding/cannotUseService/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      description: pageContent.description,
      link: pageContent.link,
      hideBackLink: true
    })
  }
}
