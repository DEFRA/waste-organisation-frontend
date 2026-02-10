const { faker } = require('@faker-js/faker')
const crypto = require('crypto')

describe('Encription', () => {
  let mockEmail

  beforeEach(() => {
    mockEmail = faker.internet.email()
  })

  test('should encrypt string', () => {
    const iv = crypto.randomBytes(12).toString('base64')
    const key = crypto.randomBytes(32).toString('base64')

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      Buffer.from(iv, 'base64')
    )

    let ciphertext = cipher.update(mockEmail, 'utf8', 'base64')
    ciphertext += cipher.final('base64')
    const tag = cipher.getAuthTag()

    console.log('ciphertext', ciphertext)
    console.log('tag', tag)
  })
})
