import { content } from '../../../config/content.js'

export const cannotUseServiceController = {
  async handler(request, h) {
    const pageContent = content.cannotUseService(request)

    return h.view('onboarding/cannotUseService/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      link: pageContent.link
    })
  }
}
