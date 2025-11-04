import { config } from '../../../../config/config'
import { checkGroups } from './check-groups'

test('groups match', () => {
  config.set('auth.entraId.groups', ['12345'])

  expect(() => checkGroups(['12345'])).not.toThrow()
})

test('groups do not match', () => {
  config.set('auth.entraId.groups', ['not-this-one'])

  expect(() => checkGroups(['12345'])).toThrow('group not allowed')
})
