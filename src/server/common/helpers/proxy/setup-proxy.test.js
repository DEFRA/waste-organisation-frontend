import Wreck from '@hapi/wreck'
import http from 'node:http'
import https from 'node:https'

import { setupProxy } from './setup-proxy.js'
import { config } from '../../../../config/config.js'

describe('setupProxy', () => {
  afterEach(() => {
    config.set('httpProxy', null)
  })

  test('Should not setup proxy if the environment variable is not set', () => {
    config.set('httpProxy', null)
    setupProxy()

    expect(Wreck.agents.http).not.toBe(http.globalAgent)
    expect(Wreck.agents.https).not.toBe(https.globalAgent)
  })

  test('Should setup proxy if the environment variable is set', () => {
    config.set('httpProxy', 'http://localhost:8080')
    setupProxy()

    expect(Wreck.agents.http).toBe(http.globalAgent)
    expect(Wreck.agents.https).toBe(https.globalAgent)
  })
})
