import { config } from '../../config.js'
import { paths } from '../../paths.js'

export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated && config.get('featureFlags.signOut')) {
    return [
      {
        text: 'Sign out',
        href: paths.signOut
      }
    ]
  }

  return []
}
