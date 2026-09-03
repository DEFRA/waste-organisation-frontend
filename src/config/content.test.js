import { expect } from 'vitest'
import { getContentForLanguage } from './content'

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

const modules = import.meta.glob('../server/**/content.js', { eager: true })

const pages = Object.values(modules).flatMap((mod) =>
  Object.entries(mod).flatMap(([exportName, exported]) =>
    exported && typeof exported === 'object'
      ? Object.entries(exported)
          .filter(([, value]) => typeof value === 'function')
          .map(([key, fn]) => [`${exportName}.${key}`, fn])
      : []
  )
)

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
  test.each(pages)(
    '%s: object stucture should match per language',
    (_name, fn) => {
      const englishContent = fn({ locale: 'en' })
      const welshContent = fn({ locale: 'cy' })

      expect(shape(englishContent)).toEqual(shape(welshContent))
    }
  )

  // zzzzz is the sentinel for strings not in the Welsh pack. Keep this skipped until those gaps are filled.
  test.skip.each(pages)(
    '%s: object stucture should match per language and should not include zzzzz',
    (_name, fn) => {
      const englishContent = fn({ locale: 'en' })
      const welshContent = fn({ locale: 'cy' })

      expect(shape(englishContent, 'zzzzz')).toEqual(
        shape(welshContent, 'zzzzz')
      )
    }
  )
})
