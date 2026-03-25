const signOutData = document.getElementById('sign-out-data')

if (signOutData) {
  try {
    window.localStorage.clear()
  } catch (_error) {
    // localStorage may be unavailable
  }

  const logoutUrl = signOutData.dataset.logoutUrl

  if (logoutUrl) {
    window.location.href = logoutUrl
  }
}
