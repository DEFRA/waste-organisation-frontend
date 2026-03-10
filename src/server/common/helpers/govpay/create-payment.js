import wreck from '@hapi/wreck'
import { randomUUID } from 'node:crypto'

import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'

const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'

const govPayRequestOptions = (apiKey) => ({
  json: true,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})

export const createGovPayPayment = async () => {
  const { apiUrl, apiKey, serviceChargeAmountPence } = config.get('govPay')
  const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')

  const { res, payload } = await wreck.post(
    `${apiUrl.replace(/\/$/, '')}/payments`,
    {
      ...govPayRequestOptions(apiKey),
      payload: {
        amount: serviceChargeAmountPence,
        description: SERVICE_CHARGE_DESCRIPTION,
        reference: `WASTE-SC-${randomUUID()}`,
        return_url: `${appBaseUrl}${paths.paymentDetails}`
      }
    }
  )

  if (res?.statusCode >= 400) {
    const reason =
      payload?.description ??
      payload?.message ??
      payload?.detail ??
      `GovPay returned status ${res.statusCode}`

    throw new Error(reason)
  }

  const nextUrl = payload?._links?.next_url?.href

  if (!nextUrl) {
    throw new Error('GovPay did not return a next_url for payment journey')
  }

  return {
    paymentId: payload.payment_id,
    nextUrl
  }
}

export const getGovPayPaymentStatus = async (paymentId) => {
  const { apiUrl, apiKey } = config.get('govPay')
  const { res, payload } = await wreck.get(
    `${apiUrl.replace(/\/$/, '')}/payments/${paymentId}`,
    govPayRequestOptions(apiKey)
  )

  if (res?.statusCode >= 400) {
    const reason =
      payload?.description ??
      payload?.message ??
      payload?.detail ??
      `GovPay returned status ${res.statusCode}`

    throw new Error(reason)
  }

  return payload?.state?.status
}
