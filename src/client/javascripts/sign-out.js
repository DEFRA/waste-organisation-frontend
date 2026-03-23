const signOutForm = document.getElementById('sign-out-form')

if (signOutForm) {
  try {
    window.localStorage.clear()
  } catch (_error) {
    // localStorage may be unavailable
  }

  const logoutMethod = signOutForm.dataset.logoutMethod

  if (logoutMethod === 'post') {
    signOutForm.submit()
  } else {
    const logoutUrl = new URL(signOutForm.action)
    new FormData(signOutForm).forEach((value, key) => {
      logoutUrl.searchParams.set(key, value)
    })
    window.location.href = logoutUrl.toString()
  }
}
