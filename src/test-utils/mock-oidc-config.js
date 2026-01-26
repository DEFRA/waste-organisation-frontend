import { vi } from 'vitest'

export const wreckGetMock = vi.fn()
export const wreckPostMock = vi.fn()
export const wreckPutMock = vi.fn()

export const mockOidcConfig = (domain = 'http://localhost:2') => {
  vi.doMock('@hapi/wreck', () => ({
    default: {
      get: wreckGetMock.mockReturnValue({
        payload: {
          issuer: `${domain}/path`,
          authorization_endpoint: `${domain}/path`,
          token_endpoint: `${domain}/path`,
          end_session_endpoint: `${domain}/path`,
          jwks_uri: `${domain}/path`,
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
      }),
      post: wreckPostMock.mockReturnValue({ payload: { post: 'response' } }),
      put: wreckPutMock.mockReturnValue({ payload: { put: 'response' } })
    }
  }))
}
