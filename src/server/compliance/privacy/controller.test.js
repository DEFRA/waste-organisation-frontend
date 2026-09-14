import { JSDOM } from 'jsdom'
import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'

const nrwPrivacyNoticeUrl =
  'https://naturalresources.wales/footer-links/privacy-notice/'

describe('#privacyNoticeController', () => {
  let server
  let initialWelshLanguageFlag

  beforeAll(async () => {
    initialWelshLanguageFlag = config.get('featureFlags.welshLanguage')
    server = await initialiseServer()
  })

  afterEach(() => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
  })

  afterAll(async () => {
    config.set('featureFlags.welshLanguage', initialWelshLanguageFlag)
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 with the correct page title', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Privacy notice |'))
  })

  test('Should have a link to privacy notice in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    expect(result).toEqual(expect.stringContaining('href="/privacy-notice"'))
  })

  test('Should render the privacy notice content', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    const { document } = new JSDOM(payload).window

    const heading = document.querySelector('h1')
    expect(heading.textContent).toContain('Privacy notice')

    const sectionHeadings = document.querySelectorAll(
      '.govuk-grid-column-two-thirds h2'
    )
    expect(sectionHeadings).toHaveLength(11)
    expect(sectionHeadings[0].textContent).toContain(
      'Who collects your personal data'
    )

    const nrwLink = document.querySelector(`a[href^="${nrwPrivacyNoticeUrl}"]`)
    expect(nrwLink.getAttribute('href')).toBe(`${nrwPrivacyNoticeUrl}?lang=en`)
  })

  test('Should open the Natural Resources Wales privacy notice in Welsh when lang=cy', async () => {
    config.set('featureFlags.welshLanguage', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.privacyNotice}?lang=cy`
    })

    const { document } = new JSDOM(payload).window
    const nrwLink = document.querySelector(`a[href^="${nrwPrivacyNoticeUrl}"]`)

    expect(nrwLink.getAttribute('href')).toBe(`${nrwPrivacyNoticeUrl}?lang=cy`)
  })
})
