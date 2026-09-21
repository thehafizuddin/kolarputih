import crypto from 'node:crypto'

/**
 * AES-256-GCM. The CHIP secret key is encrypted before it is written to the
 * database and only decrypted inside the serverless function. The plaintext
 * never reaches the browser and never lands in a file or a log.
 */
const ALGO = 'aes-256-gcm'

function getKey() {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY
  if (!raw) throw new Error('SETTINGS_ENCRYPTION_KEY is not configured')
  const buf = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  if (buf.length !== 32) throw new Error('SETTINGS_ENCRYPTION_KEY must decode to exactly 32 bytes')
  return buf
}

/** "iv:tag:ciphertext", all base64. */
export function encryptSecret(plaintext) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), ct.toString('base64')].join(':')
}

export function decryptSecret(payload) {
  if (!payload) return null
  const parts = String(payload).split(':')
  if (parts.length !== 3) throw new Error('malformed ciphertext')
  const [iv, tag, ct] = parts.map((p) => Buffer.from(p, 'base64'))
  const d = crypto.createDecipheriv(ALGO, getKey(), iv)
  d.setAuthTag(tag)
  return Buffer.concat([d.update(ct), d.final()]).toString('utf8')
}

/** Shows only the tail so the admin can recognise which key is stored. */
export function maskSecret(v) {
  if (!v) return ''
  const s = String(v)
  return s.length <= 4 ? '••••' : '••••' + s.slice(-4)
}

/** scrypt password hash for the admin login. */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(String(password), salt, 64, { N: 16384, r: 8, p: 1 })
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export function verifyPassword(password, stored) {
  if (!stored) return false
  const [scheme, saltB64, keyB64] = String(stored).split('$')
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false
  const salt = Buffer.from(saltB64, 'base64')
  const expected = Buffer.from(keyB64, 'base64')
  const actual = crypto.scryptSync(String(password), salt, expected.length, { N: 16384, r: 8, p: 1 })
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}
