import { JSDOM } from 'jsdom'

import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { config } from '../../../config/config.js'

const englishConditions = [
  'you are authorised to act on behalf of your organisation',
  'the information you have given is complete and correct',
  "you understand your organisation's legal responsibility to provide this information",
  'you understand that giving false or misleading information may be a criminal offence'
]

describe('#termsController', () => {
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
    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    const { document } = new JSDOM(payload).window

    expect(statusCode).toBe(statusCodes.ok)
    expect(document.title).toEqual(expect.stringContaining('Terms |'))
  })

  test('Should have a link to terms in the footer', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(result).toEqual(expect.stringContaining('href="/terms"'))
  })

  test('Should render the English terms page', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Terms |'))
    expect(document.querySelector('h1').textContent).toContain('Terms')
    expect(document.querySelector('.govuk-body').textContent).toContain(
      'By using this service you confirm:'
    )

    const listItems = document.querySelectorAll('.govuk-list--bullet li')
    expect(listItems).toHaveLength(englishConditions.length)
    englishConditions.forEach((condition, index) => {
      expect(listItems[index].textContent).toEqual(
        expect.stringContaining(condition)
      )
    })
  })

  test('Should render the Welsh terms page when lang=cy', async () => {
    config.set('featureFlags.welshLanguage', true)

    const { payload } = await server.inject({
      method: 'GET',
      url: `${paths.terms}?lang=cy`
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(expect.stringContaining('Telerau |'))
    expect(document.querySelector('h1').textContent).toContain('Telerau')
    expect(document.querySelectorAll('.govuk-list--bullet li')).toHaveLength(4)
  })
})
