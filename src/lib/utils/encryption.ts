// Encryption utilities for sensitive data (wellness logs)
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

// Default fallback key for development/build time (64 hex characters = 32 bytes)
const DEFAULT_KEY = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'

// Get encryption key from environment or use fallback
const getEncryptionKey = (): Buffer => {
  const envKey = process.env.ENCRYPTION_KEY
  
  if (!envKey || envKey.length !== 64) {
    console.warn('[Encryption] ENCRYPTION_KEY not set or invalid length, using fallback key')
    console.warn('[Encryption] For production, set ENCRYPTION_KEY to a 64-character hex string')
    return Buffer.from(DEFAULT_KEY, 'hex')
  }
  
  return Buffer.from(envKey, 'hex')
}

const KEY = getEncryptionKey()

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
