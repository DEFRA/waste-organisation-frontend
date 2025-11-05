import { wreck } from '@hapi/wreck'
import { getOpenIdConfig } from './open-id-client'
import { expect } from 'vitest'

const oidcConfigUrl = 'https://some-oidc-configuration-endpoint'

vi.mock('@hapi/wreck', () => ({
  wreck: {
    get: vi.fn().mockReturnValue({
      payload: {
        url: 'example.com'
      }
    })
  }
}))

describe('#getOpenIdConfig', () => {
  test('Should call wreck get', async () => {
    const payload = await getOpenIdConfig(oidcConfigUrl)

    expect(wreck.get).toHaveBeenCalledWith(
      oidcConfigUrl,
      expect.objectContaining({
        json: 'strict'
      })
    )

    expect(payload).toEqual({
      url: 'example.com'
    })
  })
})
