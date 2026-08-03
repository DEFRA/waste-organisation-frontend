import { expect } from 'vitest'
import { content } from './content'

function shape(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value && typeof value === 'object' ? shape(value) : null
    ])
  )
}

describe('Content', () => {
  test('object stucture should match per language', () => {
    const englishContent = content.ukPermit({ locale: 'en' })
    const welshContent = content.ukPermit({ locale: 'zz' })

    expect(shape(englishContent)).toEqual(shape(welshContent))
  })
})
