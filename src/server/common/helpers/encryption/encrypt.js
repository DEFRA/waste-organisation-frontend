import crypto from 'node:crypto'

const ivEncryptionSize = 12

export const encrypt = (encryptionString, key) => {
  const iv = crypto.randomBytes(ivEncryptionSize)

  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'base64'),
    iv
  )

  const ciphertext = Buffer.concat([
    cipher.update(encryptionString, 'utf8'),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    ciphertext.toString('base64'),
    tag.toString('base64')
  ]
}
