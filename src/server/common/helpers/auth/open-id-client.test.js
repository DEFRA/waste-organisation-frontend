import wreck from '@hapi/wreck'
import { expect, vi } from 'vitest'
import { getOpenIdConfig } from './open-id-client.js'

const oidcConfigUrl = 'https://some-oidc-configuration-endpoint'

describe('#getOpenIdConfig', () => {
  test('Should call wreck get', async () => {
    vi.spyOn(wreck, 'get').mockReturnValue({
      payload: {
        url: 'example.com'
      }
    })

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
