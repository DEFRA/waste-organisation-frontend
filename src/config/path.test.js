import { pathTo } from './paths.js'

describe('pathTo', () => {
  test('should expand put url with route params', () => {
    const p = '/user/{userId}/organisation/{organisationId}'
    const o = { userId: 123, organisationId: 456 }
    expect(pathTo(p, o)).toBe('/user/123/organisation/456')
  })

  test('should expand get url with route params', () => {
    const p = '/user/{userId}/organisations'
    const o = { userId: 123 }
    expect(pathTo(p, o)).toBe('/user/123/organisations')
  })

  test('should error when key missing', () => {
    const p = '/user/{userId}/organisations'
    const o = {}
    expect(() => pathTo(p, o)).toThrow(/Missing key/)
  })
})
