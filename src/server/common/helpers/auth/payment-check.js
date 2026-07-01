import { config } from '../../../../config/config.js'
import { paths } from '../../../../config/paths.js'
import { getPaymentStatus } from '../govpay/paymentStatus.js'

export async function paymentCheck(request, h) {
  const isServiceChargeEnabled = config.get('featureFlags.serviceCharge')

  if (!isServiceChargeEnabled) {
    return h.continue
  }

  const { id, currentOrganisationId } = request.auth.credentials

  const organisation = await request.backendApi.getOrganisation(
    id,
    currentOrganisationId
  )

  const paymentStatus = getPaymentStatus(organisation)

  if (paymentStatus.disabled) {
    return h.redirect(paths.account).takeover()
  }

  return h.continue
}
