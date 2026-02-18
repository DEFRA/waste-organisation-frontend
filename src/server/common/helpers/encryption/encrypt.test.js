import { faker } from '@faker-js/faker'
import crypto from 'node:crypto'
import { encrypt } from './encrypt'

describe('Encription', () => {
  let mockEmail
  const key = crypto.randomBytes(32).toString('base64')

  beforeAll(() => {
    mockEmail = faker.internet.email()
  })

  test('should encrypt string', () => {
    const resp = encrypt(mockEmail, key)

    const [ivB64, ciphertextB64, tagB64] = resp

    const iv = Buffer.from(ivB64, 'base64')
    const ciphertext = Buffer.from(ciphertextB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv
    )
    decipher.setAuthTag(tag)

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ])

    expect(plaintext.toString('utf8')).toBe(mockEmail)
  })
})
