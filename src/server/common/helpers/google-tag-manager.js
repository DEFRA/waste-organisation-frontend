import { createHash } from 'node:crypto'

import { config } from '../../../config/config.js'

/*
 * Google Tag Manager container snippet.
 *
 * We keep the script here, in its own file, as a single string, so the Content
 * Security Policy can hash exactly what the template renders and the hash and
 * markup don't drift apart and cause trouble.
 *
 */
export const googleTagManagerId = config.get('googleTagManager.id')

export const googleTagManagerHeadScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`

// sha256 of the inline script, so scriptSrc can allow it without 'unsafe-inline'
export const googleTagManagerScriptHash = `sha256-${createHash('sha256').update(googleTagManagerHeadScript).digest('base64')}`

// Hosts the tags talk to, for whoever needs to allow them (e.g. the Content-Security-Policy)
export const googleTagManagerHost = 'https://www.googletagmanager.com'
export const googleAnalyticsHost = 'https://www.google-analytics.com'
