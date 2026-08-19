import { expect } from 'vitest'
import { content } from './content'

function shape(obj, replaceValue = null) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === replaceValue
        ? value
        : value && typeof value === 'object'
          ? shape(value)
          : null
    ])
  )
}

describe('Content', () => {
  test.each(Object.keys(content))(
    '%s: object stucture should match per language ',
    (key) => {
      const englishContent = content[key]({ locale: 'en' })
      const welshContent = content[key]({ locale: 'cy' })

      expect(shape(englishContent)).toEqual(shape(welshContent))
    }
  )

  test.each(Object.keys(content))(
    '%s: object stucture should match per language and should not include zzzzz',
    (key) => {
      const englishContent = content[key]({ locale: 'en' })
      const welshContent = content[key]({ locale: 'cy' })

      expect(shape(englishContent, 'zzzzz')).toEqual(
        shape(welshContent, 'zzzzz')
      )
    }
  )
})
