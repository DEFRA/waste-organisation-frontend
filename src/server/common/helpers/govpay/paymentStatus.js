export const getPaymentStatus = (
  { disableAfter, paymentPeriods },
  locale = 'en-GB'
) => {
  const paid = 'Paid'
  const due = 'Payment due'

  if (new Date(disableAfter) < new Date()) {
    return { disabled: true, label: due, canPay: true }
  }

  const status = {
    disabled: false,
    label: paid,
    nextDue: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long'
    }).format(new Date(disableAfter)),
    canPay: true
  }

  if (paymentPeriods.length >= 1) {
    return { ...status, canPay: true }
  }

  return { ...status, canPay: false }
}
