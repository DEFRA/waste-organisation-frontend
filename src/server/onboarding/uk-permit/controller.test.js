import { initialiseServer } from '../../../test-utils/initialise-server'

describe('ukPermit', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
})
