import { content } from '../../config/content.js'

export const cookiesController = {
  handler(request, h) {
    const pageContent = content.cookies(request)

    return h.view('cookies/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph,
      essentialCookiesHeading: pageContent.essentialCookiesHeading,
      essentialCookiesDescription: pageContent.essentialCookiesDescription,
      cookieTable: pageContent.cookieTable
    })
  }
}
