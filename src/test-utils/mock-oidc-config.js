import { vi } from 'vitest'

export const mockOidcConfig = (domain = 'http://some-token-endpoint') => {
  vi.mock('@hapi/wreck', () => ({
    default: {
      get: async (url) => {
        const d = 'http://example.com'

        return {
          payload: {
            issuer: `${d}/path`,
            authorization_endpoint: `${d}/path`,
            token_endpoint: `${d}/path`,
            end_session_endpoint: `${d}/path`,
            jwks_uri: `${d}/path`,
            response_modes_supported: ['query', 'fragment', 'form_post'],
            response_types_supported: [
              'code',
              'code id_token',
              'code token',
              'code id_token token',
              'id_token',
              'id_token token',
              'token',
              'token id_token'
            ],
            scopes_supported: ['openid'],
            subject_types_supported: ['pairwise'],
            id_token_signing_alg_values_supported: ['RS256'],
            token_endpoint_auth_methods_supported: [],
            claims_supported: [
              'sub',
              'contactId',
              'email',
              'firstName',
              'lastName',
              'serviceId',
              'correlationId',
              'sessionId',
              'uniqueReference',
              'loa',
              'aal',
              'enrolmentCount',
              'enrolmentRequestCount',
              'currentRelationshipId',
              'relationships',
              'roles',
              'iss',
              'iat',
              'exp',
              'aud',
              'acr',
              'nonce',
              'auth_time'
            ]
          }
        }
      }
    }
  }))
}
