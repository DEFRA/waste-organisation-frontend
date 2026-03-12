import wreck from '@hapi/wreck'
import { randomUUID } from 'node:crypto'

import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../constants/status-codes.js'

const SERVICE_CHARGE_DESCRIPTION =
  'Annual report receipt of waste service charge'

const createPaymentReference = () =>
  `WASTE-${randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`

export const createGovPayPayment = async () => {
  const { apiUrl, apiKey, serviceChargeAmountPence } = config.get('govPay')
  const appBaseUrl = config.get('appBaseUrl').replace(/\/$/, '')

  const { res, payload } = await wreck.post(
    `${apiUrl.replace(/\/$/, '')}/payments`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      payload: {
        amount: serviceChargeAmountPence,
        description: SERVICE_CHARGE_DESCRIPTION,
        reference: createPaymentReference(),
        return_url: `${appBaseUrl}${paths.paymentDetails}`
      }
    }
  )

  if (res?.statusCode >= statusCodes.badRequest) {
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

  const paymentId = payload?.payment_id

  if (!paymentId) {
    throw new Error('GovPay did not return a payment_id for payment journey')
  }

  return {
    paymentId,
    nextUrl
  }
}
