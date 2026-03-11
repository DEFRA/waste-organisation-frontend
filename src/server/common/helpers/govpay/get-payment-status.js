import wreck from '@hapi/wreck'

import { config } from '../../../../config/config.js'
import { statusCodes } from '../../constants/status-codes.js'

export const getGovPayPaymentStatus = async (paymentId) => {
  const { apiUrl, apiKey } = config.get('govPay')
  const { res, payload } = await wreck.get(
    `${apiUrl.replace(/\/$/, '')}/payments/${paymentId}`,
    {
          json: 'strict',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
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

  return {
    status: payload?.state?.status,
    amount: payload?.amount,
    reference: payload?.reference
  }
}