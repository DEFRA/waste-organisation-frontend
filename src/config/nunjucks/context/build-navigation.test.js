import { vi } from 'vitest'
import { buildNavigation } from './build-navigation.js'
import { config } from '../../config.js'

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

  test('Should include sign out link when authenticated and feature flag enabled', () => {
    vi.spyOn(config, 'get').mockImplementation((key) => {
      if (key === 'featureFlags.signOut') return true
      return config.get(key)
    })

    const result = buildNavigation(
      mockRequest({ path: '/', auth: { isAuthenticated: true } })
    )

    expect(result).toEqual([
      {
        text: 'Sign out',
        href: '/sign-out'
      }
    ])

    config.get.mockRestore()
  })

  test('Should not include sign out link when feature flag disabled', () => {
    vi.spyOn(config, 'get').mockImplementation((key) => {
      if (key === 'featureFlags.signOut') return false
      return config.get(key)
    })

    const result = buildNavigation(
      mockRequest({ path: '/', auth: { isAuthenticated: true } })
    )

    expect(result).toEqual([])

    config.get.mockRestore()
  })
})
