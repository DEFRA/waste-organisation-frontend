import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const reviewPaymentController = {
  async handler(request, h) {
    const { id, currentOrganisationId, currentOrganisationName } =
      request.auth.credentials

    const organisation = await request.backendApi.getOrganisation(
      id,
      currentOrganisationId
    )
    const organisationName = currentOrganisationName?.trim()
    const pageContent = content.reviewPayment(request, organisationName)
    return h.view('serviceCharge/reviewPayment/index', {
      pageTitle: pageContent.title,
      heading: {
        text: pageContent.heading
      },
      intro: pageContent.intro,
      accessUntil: formatDate(
        new Date(organisation.paymentPeriods[0].to),
        pageContent.accessUntilDateIso
      ),
      sectionHeading: pageContent.sectionHeading,
      organisation: pageContent.organisation,
      continueText: pageContent.continue,
      continueHref: paths.initiatePayment,
      cancelLink: {
        text: pageContent.cancel,
        href: paths.account
      }
    })
  }
}

const formatDate = (date, locale = 'en-GB') => {
  const time = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
    .format(date)
    .toLowerCase()
    .replace(' ', '')

  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: 'long'
  }).format(date)

  const day = new Intl.DateTimeFormat(locale, {
    day: 'numeric'
  }).format(date)

  const month = new Intl.DateTimeFormat(locale, {
    month: 'long'
  }).format(date)

  const year = new Intl.DateTimeFormat(locale, {
    year: 'numeric'
  }).format(date)

  const onWord = locale.startsWith('cy') ? 'ar' : 'on'

  return `${time} ${onWord} ${weekday} ${day} ${month} ${year}`
}
