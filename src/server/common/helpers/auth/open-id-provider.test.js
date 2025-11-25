import jwt from '@hapi/jwt'
import { expect, test } from 'vitest'
import { config } from '../../../../config/config.js'
import { openIdProvider } from './open-id-provider.js'

vi.mock('./open-id-client.js', () => ({
  getOpenIdConfig: vi.fn().mockReturnValue({
    authorization_endpoint: 'http://some-auth-endpoint/path',
    token_endpoint: 'http://some-token-endpoint/path',
    end_session_endpoint: 'http://some-end-session-endpoint/path'
  })
}))

test.each([
  { credentials: null },
  { credentials: {} },
  { credentials: { token: null } }
])('credentials do not exist', async (credentials) => {
  const provider = await openIdProvider('defraId', {
    oidcConfigurationUrl: 'https://test.it/path'
  })

  await expect(async () => await provider.profile(credentials)).rejects.toThrow(
    'defraId Auth Access Token not present. Unable to retrieve profile.'
  )
})

test('defraId: credentials exist', async () => {
  const provider = await openIdProvider('defraId', {
    oidcConfigurationUrl: 'https://test.it/path',
    scopes: ['email']
  })

  const currentRelationshipId = 'rel-id-909'
  const organisationId = 'org-id-123'

  config.set('auth.defraId.organisations', [organisationId])

  const token = jwt.token.generate(
    {
      sub: 'testSub',
      correlationId: 'testCorrelationId',
      sessionId: 'testSessionId',
      contactId: 'testContactId',
      serviceId: 'testServiceId',
      firstName: 'Test',
      lastName: 'User',
      email: 'testEmail',
      uniqueReference: 'testUniqueRef',
      loa: 'testLoa',
      aal: 'testAal',
      enrolmentCount: 1,
      enrolmentRequestCount: 1,
      currentRelationshipId,
      relationships: [`${currentRelationshipId}:${organisationId}`],
      roles: 'testRoles',
      aud: 'test',
      iss: 'test',
      user: 'Test User'
    },
    {
      key: 'test',
      algorithm: 'HS256'
    },
    {
      ttlSec: 1
    }
  )

  const credentials = { token }

  await provider.profile(credentials, { id_token: 'test-id-token' }, {})

  expect(credentials.profile).toEqual({
    id: 'testSub',
    correlationId: 'testCorrelationId',
    sessionId: 'testSessionId',
    contactId: 'testContactId',
    serviceId: 'testServiceId',
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    email: 'testEmail',
    uniqueReference: 'testUniqueRef',
    loa: 'testLoa',
    aal: 'testAal',
    enrolmentCount: 1,
    enrolmentRequestCount: 1,
    currentRelationshipId,
    relationships: [`${currentRelationshipId}:${organisationId}`],
    roles: 'testRoles',
    idToken: 'test-id-token',
    tokenUrl: 'http://some-token-endpoint/path',
    logoutUrl: 'http://some-end-session-endpoint/path'
  })

  expect(config.get('auth.origins')).toEqual([
    'https://test.it',
    'http://some-auth-endpoint',
    'http://some-token-endpoint',
    'http://some-end-session-endpoint'
  ])
})

test('defraId: provider setup correctly', async () => {
  const provider = await openIdProvider('defraId', {
    oidcConfigurationUrl: 'https://test.it/path',
    scopes: ['email']
  })

  const organisationId = 'org-id-123'

  config.set('auth.defraId.organisations', [organisationId])

  expect(provider).toEqual({
    name: 'defraId',
    protocol: 'oauth2',
    useParamsAuth: true,
    auth: 'http://some-auth-endpoint/path',
    token: 'http://some-token-endpoint/path',
    pkce: 'S256',
    scope: ['email'],
    profile: expect.any(Function)
  })
})

test('entraId: group not allowed', async () => {
  const provider = await openIdProvider('entraId', {
    oidcConfigurationUrl: 'https://test.it/path'
  })

  config.set('auth.entraId.groups', ['allowed-group'])

  const token = jwt.token.generate(
    {},
    {
      key: 'test',
      algorithm: 'HS256'
    }
  )
  const idToken = jwt.token.generate(
    {
      groups: ['not-allowed-group']
    },
    {
      key: 'test',
      algorithm: 'HS256'
    }
  )

  const credentials = {
    provider: 'entraId',
    token
  }
  const params = {
    id_token: idToken
  }

  await expect(async () =>
    provider.profile(credentials, params, {})
  ).rejects.toThrow('group not allowed')
})
