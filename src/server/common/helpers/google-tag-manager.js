import { config } from '../../../config/config.js'

/*
 * Google Tag Manager data, shared for whoever needs them. The tag is loaded
 * client-side (see the cookie-banner scripts) only once the user has accepted
 * analytics cookies, so there is no more inline snippet or script hash
 * here: the browser fetches gtm.js from the GTM host, which the
 * Content-Security-Policy allows by host rather than by hash.
 */
export const googleTagManagerId = config.get('googleTagManager.id')

/*
 * Hosts GTM and Google Analytics 4 need, per CSP directive, following Google's
 * guidance (https://developers.google.com/tag-platform/security/guides/csp).
 * Wildcards because GA4 doesn't only use www.google-analytics.com: it sends hits to
 * regional hosts such as region1.google-analytics.com (used for UK/EU traffic) and
 * region1.analytics.google.com.
 *
 * Custom HTML tags in the GTM container still won't run: they're inline scripts,
 * which the policy deliberately doesn't allow.
 */
export const googleAnalyticsCspSources = {
  scriptSrc: ['https://*.googletagmanager.com'], // nosonar
  connectSrc: [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com' // nosonar
  ],
  imgSrc: ['https://*.google-analytics.com', 'https://*.googletagmanager.com'] // nosonar
}
