import { content } from '../../config/content.js'

export const privacyNoticeController = {
  handler(request, h) {
    const pageContent = content.privacyNotice(request)

    return h.view('privacy/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph,
      sections: pageContent.sections
    })
  }
}
