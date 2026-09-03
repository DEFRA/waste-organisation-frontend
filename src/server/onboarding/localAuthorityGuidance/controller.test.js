import { expect } from 'vitest'
import { onboarding } from '../content.js'
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
    const pageContent = onboarding.localAuthorityGuidance()
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.localAuthorityGuidance
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

    const steps = document.querySelectorAll(
      '.govuk-list.govuk-list--number > li'
    )

    expect(steps.length).toEqual(3)
    expect(steps[0].textContent).toEqual(pageContent.steps[0])
    expect(steps[1].textContent).toEqual(pageContent.steps[1])
    expect(steps[2].textContent).toEqual(pageContent.steps[2])

    const finalNote = document.querySelector('.final-note').textContent

    expect(finalNote).toEqual(expect.stringContaining(pageContent.finalNote))

    const link = document.querySelector(
      '[data-testid="local-authority-signin"]'
    )

    expect(link.getAttribute('href')).toBe(pageContent.link.href)
    expect(link.textContent).toEqual(
      expect.stringContaining(pageContent.link.text)
    )
  })
})
