import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'

import { JSDOM } from 'jsdom'

describe('#cannotUseServiceController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const pageContent = content.cannotUseService()
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cannotUseService
    })

    const { document } = new JSDOM(payload).window

    const pageHeading = document.querySelectorAll(
      '[data-testid="app-heading-title"]'
    )[0].textContent

    const pageDescription = document.querySelectorAll(
      '[data-testid="app-heading-caption"]'
    )[0].textContent

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )
    expect(pageHeading).toEqual(
      expect.stringContaining(pageContent.heading.text)
    )
    expect(pageDescription).toEqual(
      expect.stringContaining(pageContent.heading.caption)
    )
  })
})
