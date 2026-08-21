import { account } from '../server/account/content.js'
import { apiManagement } from '../server/apiManagement/content.js'
import { authentication } from '../server/authentication/content.js'
import { onboarding } from '../server/onboarding/content.js'
import { serviceCharge } from '../server/serviceCharge/content.js'
import { spreadsheet } from '../server/spreadsheet/content.js'

export const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

export const getContentForLanguage = (request, data) => {
  const locale = request?.locale ?? 'cy'
  return data[locale]
}

/* v8 ignore next */
export const content = {
  ...account,
  ...onboarding,
  ...apiManagement,
  ...serviceCharge,
  ...authentication,
  ...spreadsheet
}
