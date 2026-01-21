import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const flashMessage = 'isNextActionError'

export const nextActionController = {
  async handler(request, h) {
    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.nextAction(request, organisationName)

    const [error] = request.yar.flash(flashMessage)
    let errorContent

    if (error) {
      errorContent = pageContent.error
    }

    const questions = Object.entries(pageContent.questions).map((question) => {
      const [key, value] = question
      return {
        value: key,
        text: value,
        id: key,
        attributes: {
          'data-testid': `${key}-radio`
        },
        label: {
          attributes: {
            'data-testid': `${key}-label`
          }
        }
      }
    })

    return h.view('nextAction/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      description: pageContent.description,
      link: pageContent.link,
      action: {
        url: paths.nextAction,
        text: pageContent.continueAction
      },
      questions,
      error: errorContent,
      backLink: paths.ukPermit
    })
  }
}
