import { config } from '../../config.js'
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

  describe('when newAccountPage feature flag is enabled', () => {
    beforeEach(() => {
      config.set('featureFlags.newAccountPage', true)
    })

    afterEach(() => {
      config.set('featureFlags.newAccountPage', false)
    })

    test('Should include manage account and sign out links when authenticated', () => {
      const result = buildNavigation(
        mockRequest({ path: '/', auth: { isAuthenticated: true } })
      )

      expect(result).toEqual([
        {
          text: 'Manage account',
          href: config.get('auth.defraId.accountManagementUrl')
        },
        {
          text: 'Sign out',
          href: '/sign-out'
        }
      ])
    })

    test('Should return empty navigation when not authenticated', () => {
      const result = buildNavigation(
        mockRequest({ path: '/', auth: { isAuthenticated: false } })
      )

      expect(result).toEqual([])
    })

    test('Should not include manage account link on the account page', () => {
      const result = buildNavigation(
        mockRequest({ path: '/account', auth: { isAuthenticated: true } })
      )

      expect(result).toEqual([
        {
          text: 'Sign out',
          href: '/sign-out'
        }
      ])
    })
  })
})
