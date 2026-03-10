const signOutData = document.getElementById('sign-out-data')

if (signOutData) {
  const logoutUrl = signOutData.dataset.logoutUrl

  try {
    window.localStorage.clear()
  } catch (_error) {
    // localStorage may be unavailable
  }

  if (logoutUrl) {
    window.location.href = logoutUrl
  }
}
