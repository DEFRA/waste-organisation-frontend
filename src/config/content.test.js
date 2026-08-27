import { expect } from 'vitest'
import { content, getContentForLanguage } from './content'

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

describe('#getContentForLanguage', () => {
  const data = {
    en: { title: 'English' },
    cy: { title: 'Cymraeg' }
  }

  test('returns Welsh when locale is cy', () => {
    expect(getContentForLanguage({ locale: 'cy' }, data)).toEqual(data.cy)
  })

  test('returns English when locale is en', () => {
    expect(getContentForLanguage({ locale: 'en' }, data)).toEqual(data.en)
  })

  test('returns English when locale is missing', () => {
    expect(getContentForLanguage({}, data)).toEqual(data.en)
    expect(getContentForLanguage(undefined, data)).toEqual(data.en)
  })

  test('returns English when locale is unexpected', () => {
    expect(getContentForLanguage({ locale: 'fr' }, data)).toEqual(data.en)
    expect(getContentForLanguage({ locale: 'zz' }, data)).toEqual(data.en)
  })

  test('falls back to English if the selected tree is missing', () => {
    expect(getContentForLanguage({ locale: 'cy' }, { en: data.en })).toEqual(
      data.en
    )
  })
})

describe('Content', () => {
  test.each(Object.keys(content))(
    '%s: object stucture should match per language ',
    (key) => {
      const englishContent = content[key]({ locale: 'en' })
      const welshContent = content[key]({ locale: 'cy' })

      expect(shape(englishContent)).toEqual(shape(welshContent))
    }
  )

  test.skip.each(Object.keys(content))(
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
