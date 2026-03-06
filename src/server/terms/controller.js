import { content } from '../../config/content.js'

export const termsController = {
  handler(request, h) {
    const pageContent = content.terms(request)

    return h.view('terms/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      leadParagraph: pageContent.leadParagraph,
      conditions: pageContent.conditions,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: pageContent.title
        }
      ]
    })
  }
}
