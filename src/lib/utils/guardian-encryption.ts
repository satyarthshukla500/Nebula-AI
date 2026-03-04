/**
 * Guardian Mode Encryption Utilities
 * 
 * Provides encryption/decryption for sensitive Guardian Mode data:
 * - Emergency contact phone numbers
 * - Emergency contact emails
 * - Wellness check-in notes
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // Ensure key is 32 bytes for AES-256
  return Buffer.from(key.slice(0, 64), 'hex');
}

/**
 * Encrypt sensitive data
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedText - Encrypted string in format: iv:authTag:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash verification code (OTP) for storage
 * @param code - Plain text verification code
 * @returns Hashed code
 */
export function hashVerificationCode(code: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(code, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify verification code against stored hash
 * @param code - Plain text code to verify
 * @param storedHash - Stored hash in format: salt:hash
 * @returns True if code matches
 */
export function verifyCode(code: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const salt = parts[0];
    const originalHash = parts[1];
    const hash = crypto.pbkdf2Sync(code, salt, 10000, 64, 'sha512').toString('hex');
    
    return hash === originalHash;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * Generate a secure random OTP code
 * @param length - Length of OTP (default: 6)
 * @returns Random numeric OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Generate a secure opt-out token
 * @returns Random hex token
 */
export function generateOptOutToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt emergency contact data
 */
export interface EmergencyContactData {
  phone?: string;
  email?: string;
}

export function encryptContactData(data: EmergencyContactData): EmergencyContactData {
  return {
    phone: data.phone ? encrypt(data.phone) : undefined,
    email: data.email ? encrypt(data.email) : undefined,
  };
}

/**
 * Decrypt emergency contact data
 */
export function decryptContactData(data: EmergencyContactData): EmergencyContactData {
  return {
    phone: data.phone ? decrypt(data.phone) : undefined,
    email: data.email ? decrypt(data.email) : undefined,
  };
}
