import { config } from '../../config.js'
import { paths } from '../../paths.js'
import { authentication } from '../../../server/authentication/content.js'
import { account } from '../../../server/account/content.js'

export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated) {
    const pageContent = authentication.signOut(request)
    const navigation = []

    const isAccountPage = request.path === paths.account
    if (config.get('featureFlags.newAccountPage') && !isAccountPage) {
      const manageAccountContent = account.manageAccount(request)
      navigation.push({
        text: manageAccountContent.navigationLink,
        href: config.get('auth.defraId.accountManagementUrl')
      })
    }

    navigation.push({
      text: pageContent.navigationLink,
      href: paths.signOut
    })

    return navigation
  }

  return []
}
