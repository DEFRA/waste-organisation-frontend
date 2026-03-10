// @vitest-environment jsdom
describe('sign-out', () => {
  let originalLocation

  beforeEach(() => {
    document.body.innerHTML = ''
    originalLocation = window.location
    delete window.location
    window.location = { href: '' }
  })

  afterEach(() => {
    window.location = originalLocation
    vi.resetModules()
  })

  test('Should redirect to logout URL', async () => {
    document.body.innerHTML =
      '<div id="sign-out-data" data-logout-url="https://defraid.bar/logout"></div>'

    await import('./sign-out.js')

    expect(window.location.href).toBe('https://defraid.bar/logout')
  })

  test('Should handle missing sign-out-data element', async () => {
    await import('./sign-out.js')

    expect(window.location.href).toBe('')
  })

  test('Should handle localStorage clear failure', async () => {
    document.body.innerHTML =
      '<div id="sign-out-data" data-logout-url="https://defraid.bar/logout"></div>'

    const localStorageClearSpy = vi
      .spyOn(Object.getPrototypeOf(window.localStorage), 'clear')
      .mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

    await import('./sign-out.js')

    expect(window.location.href).toBe('https://defraid.bar/logout')
    localStorageClearSpy.mockRestore()
  })
})
