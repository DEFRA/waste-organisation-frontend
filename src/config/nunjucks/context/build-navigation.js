export function buildNavigation(request) {
  if (request?.auth?.isAuthenticated) {
    return [
      {
        text: 'Sign out',
        href: '/sign-out'
      }
    ]
  }

  return []
}
