export function languageToggleHref(request, locale) {
  const params = new URLSearchParams()
  const query = request?.query ?? {}

  for (const [key, value] of Object.entries(query)) {
    if (key === 'lang') {
      continue
    }

    const values = Array.isArray(value) ? value : [value]

    for (const item of values) {
      if (item === undefined || item === null) {
        continue
      }

      params.append(key, String(item))
    }
  }

  params.set('lang', locale)

  const path = request?.path ?? '/'
  return `${path}?${params.toString()}`
}
