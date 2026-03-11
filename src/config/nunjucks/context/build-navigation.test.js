import { vi } from 'vitest'
import { buildNavigation } from './build-navigation.js'
import { config } from '../../config.js'

function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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
    vi.spyOn(config, 'get').mockReturnValue(true)

    const result = buildNavigation(
      mockRequest({ path: '/', auth: { isAuthenticated: true } })
    )

    expect(config.get).toHaveBeenCalledWith('featureFlags.signOut')
    expect(result).toEqual([
      {
        text: 'Sign out',
        href: '/sign-out'
      }
    ])
  })

  test('Should not include sign out link when feature flag disabled', () => {
    vi.spyOn(config, 'get').mockReturnValue(false)

    const result = buildNavigation(
      mockRequest({ path: '/', auth: { isAuthenticated: true } })
    )

    expect(config.get).toHaveBeenCalledWith('featureFlags.signOut')
    expect(result).toEqual([])
  })
})
