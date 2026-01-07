import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { faker } from '@faker-js/faker'
import { signInController } from './controller.js'

describe('signIn', () => {
  const domain = 'http://localhost:2'
  let server

  beforeEach(async () => {
    server = await initialiseServer({ domain })
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('save token organisation', () => {
    let handler
    let request

    let savedData

    beforeEach(() => {
      savedData = []

      handler = {
        redirect: () => {}
      }

      request = {
        auth: {
          credentials: null,
          strategy: 'defraId',
          isAuthenticated: true,
          token: faker.internet.jwt(),
          refreshToken: faker.internet.jwt()
        },
        cookieAuth: {
          set: (_data) => {}
        },
        server: {
          app: {
            cache: {
              set: () => {}
            }
          }
        },
        backendApi: {
          saveOrganisation: async (userId, organisationId, orgData) => {
            savedData.push({
              userId,
              organisationId,
              orgData
            })
          }
        }
      }
    })

    test.each([null, undefined, [], [''], [':']])(
      'user with no organisations doesnt send data to backendApi',
      async (relationships) => {
        const userTokenData = {
          profile: {
            relationships
          },
          expiresIn: 1000
        }

        request.auth.credentials = userTokenData

        await signInController('TestMetric').handler(request, handler)

        expect(savedData.length).toBe(0)
      }
    )

    test.each(['', ':'])(
      'user with mix of valid relationships and valid only saves valid data',
      async (relationships) => {
        const userId = faker.string.uuid()
        const organisationId = faker.string.uuid()
        const organisationName = faker.company.name()

        const userTokenData = {
          profile: {
            id: userId,
            relationships: [
              relationships,
              `RelationshipID:${organisationId}:${organisationName}:0:Employee:0`
            ]
          },
          expiresIn: 1000
        }

        request.auth.credentials = userTokenData

        await signInController('TestMetric').handler(request, handler)

        expect(savedData.length).toBe(1)
        expect(savedData[0].userId).toBe(userId)
        expect(savedData[0].organisationId).toBe(organisationId)
        expect(savedData[0].orgData).toEqual({ name: organisationName })
      }
    )

    test('user with one organisation has their organisation set to backend api', async () => {
      const userId = faker.string.uuid()
      const organisationId = faker.string.uuid()
      const organisationName = faker.company.name()

      const userTokenData = {
        profile: {
          id: userId,
          relationships: [
            `RelationshipID:${organisationId}:${organisationName}:0:Employee:0`
          ]
        },
        expiresIn: 1000
      }

      request.auth.credentials = userTokenData

      await signInController('TestMetric').handler(request, handler)

      expect(savedData.length).toBe(1)
      expect(savedData[0].userId).toBe(userId)
      expect(savedData[0].organisationId).toBe(organisationId)
      expect(savedData[0].orgData).toEqual({ name: organisationName })
    })

    test('user with multiple organisations has their organisations set to backend api', async () => {
      const userId = faker.string.uuid()
      const organisationId = faker.string.uuid()
      const organisationName = faker.company.name()

      const organisationId2 = faker.string.uuid()
      const organisationName2 = faker.company.name()

      const userTokenData = {
        profile: {
          id: userId,
          relationships: [
            `RelationshipID:${organisationId}:${organisationName}:0:Employee:0`,
            `RelationshipID:${organisationId2}:${organisationName2}:0:Employee:0`
          ]
        },
        expiresIn: 1000
      }

      request.auth.credentials = userTokenData

      await signInController('TestMetric').handler(request, handler)

      expect(savedData.length).toBe(2)
      expect(savedData[0].userId).toBe(userId)
      expect(savedData[0].organisationId).toBe(organisationId)
      expect(savedData[0].orgData).toEqual({ name: organisationName })

      expect(savedData[1].userId).toBe(userId)
      expect(savedData[1].organisationId).toBe(organisationId2)
      expect(savedData[1].orgData).toEqual({ name: organisationName2 })
    })

    test('user with multiple organisations has their organisations set to backend api', async () => {
      const userId = faker.string.uuid()
      const organisationId = faker.string.uuid()
      const organisationName = faker.company.name()

      const userTokenData = {
        profile: {
          id: userId,
          relationships: [
            `RelationshipID:${organisationId}:${organisationName}:0:Employee:0`,
            `RelationshipID:${organisationId}:${organisationName}:0:Employee:0`
          ]
        },
        expiresIn: 1000
      }

      request.auth.credentials = userTokenData

      await signInController('TestMetric').handler(request, handler)

      expect(savedData.length).toBe(1)
      expect(savedData[0].userId).toBe(userId)
      expect(savedData[0].organisationId).toBe(organisationId)
      expect(savedData[0].orgData).toEqual({ name: organisationName })
    })
  })
})
