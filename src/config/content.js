export const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

export const getContentForLanguage = (request, data) => {
  const locale = request?.locale === 'cy' ? 'cy' : 'en'
  return data[locale] ?? data.en
}
