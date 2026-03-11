import { config } from '../../config.js'
import { content } from '../../content.js'
import { paths } from '../../paths.js'

export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated && config.get('featureFlags.signOut')) {
    const pageContent = content.signOut(request)

    return [
      {
        text: pageContent.navigationLink,
        href: paths.signOut
      }
    ]
  }

  return []
}
