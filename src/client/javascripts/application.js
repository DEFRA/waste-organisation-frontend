import { initAll } from 'govuk-frontend'
import { initCookieBanner } from './cookie-banner.js'

document.body.className += ' js-enabled govuk-frontend-supported'

// GOV.UK Frontend components, then this app's global components.
initAll()
initCookieBanner()
