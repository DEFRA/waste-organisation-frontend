import { faker } from '@faker-js/faker'
import { getPaymentStatus } from './paymentStatus'

describe('getPaymentStatus', () => {
  const due = 'Payment due'
  const paid = 'Paid'

  test('Payment Due if date passed disableAfter', () => {
    const mockOrganisation = {
      disableAfter: faker.date.past(),
      paymentPeriods: []
    }

    const actualStatus = getPaymentStatus(mockOrganisation)
    expect(actualStatus.label).toEqual(due)
    expect(actualStatus.disabled).toEqual(true)
    expect(actualStatus.canPay).toEqual(true)
  })

  test('Payment Due if disableAfter after current date and there are avalible paymentPeriods', () => {
    const mockOrganisation = {
      disableAfter: '2028-10-20T12:23:00.000Z',
      paymentPeriods: [
        {
          from: '2028-10-20T12:23:00.000Z',
          to: '2029-10-20T12:23:00.000Z',
          priceInPence: 2600
        }
      ]
    }

    const actualStatus = getPaymentStatus(mockOrganisation)
    expect(actualStatus.label).toEqual(paid)
    expect(actualStatus.disabled).toEqual(false)
    expect(actualStatus.nextDue).toEqual('October 2028')
    expect(actualStatus.canPay).toEqual(true)
  })

  test('Next due should format for different timezones', () => {
    const mockOrganisation = {
      disableAfter: '2028-10-20T12:23:00.000Z',
      paymentPeriods: [
        {
          from: '2028-10-20T12:23:00.000Z',
          to: '2029-10-20T12:23:00.000Z',
          priceInPence: 2600
        }
      ]
    }

    const actualStatus = getPaymentStatus(mockOrganisation, 'cy-gb')

    expect(actualStatus.nextDue).toEqual('Hydref 2028')
  })

  test('Paid if disableAfter after current date', () => {
    const mockOrganisation = {
      disableAfter: '2028-10-20T12:23:00.000Z',
      paymentPeriods: []
    }
    const actualStatus = getPaymentStatus(mockOrganisation)
    expect(actualStatus.label).toEqual(paid)
    expect(actualStatus.disabled).toEqual(false)
    expect(actualStatus.nextDue).toEqual('October 2028')
    expect(actualStatus.canPay).toEqual(false)
  })
})
