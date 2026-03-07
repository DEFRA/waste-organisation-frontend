import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const accountController = {
  handler(request, h) {
    if (!config.get('featureFlags.accountPage')) {
      return h.redirect(paths.nextAction)
    }

    const organisationName = request?.auth?.credentials?.currentOrganisationName

    const pageContent = content.account(request, organisationName)

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      switchOrganisation: pageContent.switchOrganisation,
      cards: pageContent.cards,
      reportWasteHref: paths.nextAction,
      manageAccountHref: paths.manageAccount
    })
  }
}
