import wreck from '@hapi/wreck'

export const getOpenIdConfig = async (oidcConfigurationUrl) => {
  const { payload } = await wreck.get(oidcConfigurationUrl, {
    json: 'strict'
  })

  return payload
}
