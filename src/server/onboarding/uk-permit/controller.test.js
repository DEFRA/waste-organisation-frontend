import globalJsdom from 'global-jsdom'
import { initialiseServer } from '../../../test-utils/initialise-server'
import { paths } from '../../../config/paths'
import { expect } from 'vitest'

describe('ukPermit', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('ukPermit page', async () => {
    const { payload } = await server.inject({
      method: 'get',
      url: paths.ukPermit
    })

    // globalJsdom(payload)

    // const pageHeading = document.querySelectorAll(
    //   'h1.govuk-fieldset__heading'
    // )[0].textContent

    // expect(document.title).toBe('ukPermit | Report receipt of waste')
    // expect(pageHeading).toEqual(
    //   expect.stringContaining(
    //     'Do you operate one or more licensed or permitted waste receiving sites?'
    //   )
    // )
  })
})
