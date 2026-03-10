import { buildNavigation } from './build-navigation.js'

function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should return empty navigation when not authenticated', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([])
  })

  test('Should return empty navigation when auth is false', () => {
    expect(
      buildNavigation(
        mockRequest({ path: '/', auth: { isAuthenticated: false } })
      )
    ).toEqual([])
  })

  test('Should include sign out link when authenticated', () => {
    const result = buildNavigation(
      mockRequest({ path: '/', auth: { isAuthenticated: true } })
    )

    expect(result).toEqual([
      {
        text: 'Sign out',
        href: '/sign-out'
      }
    ])
  })
})
