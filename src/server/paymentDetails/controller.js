import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getGovPayPaymentStatus } from '../common/helpers/govpay/create-payment.js'

const paymentSuccessFlash = 'paymentStatus'
const paymentSuccessState = 'success'

const isLikelyValidOrganisationName = (value) =>
  typeof value === 'string' &&
  value.trim().length > 1 &&
  !/^\d+$/.test(value.trim())

const resolveOrganisationNameFromRelationships = (credentials) => {
  const currentRelationshipId = credentials?.currentRelationshipId
  const relationships = Array.isArray(credentials?.relationships)
    ? credentials.relationships
    : [credentials?.relationships]

  const matchedRelationship = relationships
    .filter(Boolean)
    .find((relationship) =>
      relationship.startsWith(`${currentRelationshipId}:`)
    )

  if (!matchedRelationship) {
    return null
  }

  const [, , currentOrganisationName] =
    matchedRelationship.match(/[^:]*:([^:]*):(.*)[^:]*:[^:]*:[^:]*:[^:]*/) || [] // NOSONAR

  if (isLikelyValidOrganisationName(currentOrganisationName)) {
    return currentOrganisationName.trim()
  }

  return null
}

const resolveOrganisationName = async (request, fallbackName) => {
  const credentials = request?.auth?.credentials
  const currentOrganisationName = credentials?.currentOrganisationName

  if (isLikelyValidOrganisationName(currentOrganisationName)) {
    return currentOrganisationName.trim()
  }

  const organisationNameMissing =
    typeof currentOrganisationName !== 'string' ||
    currentOrganisationName.trim().length === 0

  if (organisationNameMissing) {
    const relationshipOrganisationName =
      resolveOrganisationNameFromRelationships(credentials)

    if (relationshipOrganisationName) {
      return relationshipOrganisationName
    }
  }

  const userId = credentials?.id
  const currentOrganisationId = credentials?.currentOrganisationId?.toString()

  if (!userId) {
    return fallbackName
  }

  const organisations = await request.backendApi.getOrganisations(userId)

  if (!Array.isArray(organisations) || organisations.length === 0) {
    return fallbackName
  }

  if (currentOrganisationId) {
    const matchedOrganisation = organisations.find(
      (organisation) => organisation?.id?.toString() === currentOrganisationId
    )

    if (isLikelyValidOrganisationName(matchedOrganisation?.name)) {
      return matchedOrganisation.name.trim()
    }
  }

  if (isLikelyValidOrganisationName(organisations[0]?.name)) {
    return organisations[0].name.trim()
  }

  return fallbackName
}

const formatPounds = (amountInPence) => {
  if (typeof amountInPence !== 'number') {
    return '£0.00'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amountInPence / 100)
}

export const paymentDetailsController = {
  async handler(request, h) {
    const paymentId = request.yar.get('govPayPaymentId')

    if (!paymentId) {
      return h.redirect(paths.account)
    }

    const pageContent = content.paymentDetails(request)
    const organisationName = await resolveOrganisationName(
      request,
      pageContent.organisationPlaceholder
    )

    let paymentReference = ''
    let paymentAmount = 0

    try {
      const payment = await getGovPayPaymentStatus(paymentId)
      const paymentStatus = payment?.status
      paymentReference = payment?.reference ?? ''
      paymentAmount = payment?.amount ?? 0

      if (paymentStatus === paymentSuccessState) {
        request.yar.flash(paymentSuccessFlash, paymentSuccessState)
      }
    } catch (error) {
      request.logger.error(
        `Failed to fetch GovPay payment status: ${error?.message ?? 'unknown error'}`
      )
    }

    request.yar.clear('govPayPaymentId')

    return h.view('paymentDetails/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      referenceLabel: pageContent.referenceLabel,
      paymentReference,
      summaryHeading: pageContent.summaryHeading,
      paymentSummary: {
        paymentForLabel: pageContent.paymentForLabel,
        paymentForValue: pageContent.paymentForValue,
        organisationLabel: pageContent.organisationLabel,
        organisationValue: organisationName,
        totalAmountLabel: pageContent.totalAmountLabel,
        totalAmountValue: formatPounds(paymentAmount)
      },
      whatHappensNextHeading: pageContent.whatHappensNextHeading,
      whatHappensNext: pageContent.whatHappensNext,
      returnLink: {
        text: `${pageContent.returnToAccountPrefix} ${organisationName} ${pageContent.returnToAccountSuffix}`
          .replace(/\s+/g, ' ')
          .trim(),
        href: paths.account
      }
    })
  }
}
