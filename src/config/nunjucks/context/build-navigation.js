import { config } from '../../config.js'
import { content } from '../../content.js'
import { paths } from '../../paths.js'

export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated) {
    const pageContent = content.signOut(request)
    const navigation = []

    const isAccountPage = request.path === paths.account
    if (config.get('featureFlags.newAccountPage') && !isAccountPage) {
      navigation.push({
        text: 'Manage account',
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
