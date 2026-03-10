import { config } from '../../config.js'

export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated && config.get('featureFlags.signOut')) {
    return [
      {
        text: 'Sign out',
        href: '/sign-out'
      }
    ]
  }

  return []
}
