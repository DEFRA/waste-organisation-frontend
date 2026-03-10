const signOutData = document.getElementById('sign-out-data')

if (signOutData) {
  const logoutUrl = signOutData.getAttribute('data-logout-url')

  try {
    window.localStorage.clear()
  } catch (_error) {
    // localStorage may be unavailable
  }

  if (logoutUrl) {
    window.location.href = logoutUrl
  }
}
