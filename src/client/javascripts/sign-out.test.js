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

  test('Should redirect via location.href for GET method', async () => {
    document.body.innerHTML =
      '<form id="sign-out-form" action="https://defraid.bar/logout" method="get" data-logout-method="get">' +
      '<input type="hidden" name="id_token_hint" value="test-token" />' +
      '<input type="hidden" name="post_logout_redirect_uri" value="http://localhost/signed-out" />' +
      '</form>'

    await import('./sign-out.js')

    expect(window.location.href).toBe(
      'https://defraid.bar/logout?id_token_hint=test-token&post_logout_redirect_uri=http%3A%2F%2Flocalhost%2Fsigned-out'
    )
  })

  test('Should submit the form for POST method', async () => {
    document.body.innerHTML =
      '<form id="sign-out-form" action="https://defraid.bar/logout" method="post" data-logout-method="post">' +
      '<input type="hidden" name="id_token_hint" value="test-token" />' +
      '<input type="hidden" name="post_logout_redirect_uri" value="http://localhost/signed-out" />' +
      '</form>'

    const submitSpy = vi.fn()
    document.getElementById('sign-out-form').submit = submitSpy

    await import('./sign-out.js')

    expect(submitSpy).toHaveBeenCalledOnce()
    expect(window.location.href).toBe('')
  })

  test('Should handle missing sign-out-form element', async () => {
    await import('./sign-out.js')

    expect(document.getElementById('sign-out-form')).toBeNull()
  })

  test('Should handle localStorage clear failure', async () => {
    document.body.innerHTML =
      '<form id="sign-out-form" action="https://defraid.bar/logout" method="get" data-logout-method="get">' +
      '<input type="hidden" name="id_token_hint" value="test-token" />' +
      '</form>'

    const localStorageClearSpy = vi
      .spyOn(Object.getPrototypeOf(window.localStorage), 'clear')
      .mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

    await import('./sign-out.js')

    expect(window.location.href).toBe(
      'https://defraid.bar/logout?id_token_hint=test-token'
    )
    localStorageClearSpy.mockRestore()
  })
})
