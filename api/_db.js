import crypto from 'node:crypto'
import pg from 'pg'

const { Pool } = pg

/**
 * Neon Postgres pool.
 *
 * Vercel Fluid compute keeps the instance warm between invocations, so a
 * module-scoped pool is safe and reuses the TCP connection instead of paying
 * the ~8 round-trip setup cost on every cold request.
 */
let pool = null

export function db() {
  if (pool) return pool
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not configured')
  pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    ssl: url.includes('sslmode=require') || url.includes('.neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  })
  pool.on('error', (e) => console.error('pg pool error:', e.message))
  return pool
}

export async function query(text, params = []) {
  const res = await db().query(text, params)
  return res.rows
}

export async function one(text, params = []) {
  const rows = await query(text, params)
  return rows[0] || null
}

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 1e6) reject(new Error('payload too large'))
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch { reject(new Error('invalid JSON')) }
    })
    req.on('error', reject)
  })
}

export function safeEqual(a, b) {
  const A = Buffer.from(String(a ?? ''))
  const B = Buffer.from(String(b ?? ''))
  if (A.length === 0 || A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

/** Admin session token = HMAC(ADMIN_TOKEN_SECRET, "admin") — no session store needed. */
export function adminToken() {
  const s = process.env.ADMIN_TOKEN_SECRET
  if (!s) throw new Error('ADMIN_TOKEN_SECRET is not configured')
  return crypto.createHmac('sha256', s).update('kolarputih-admin-v1').digest('hex')
}

export function requireAdmin(req) {
  const h = req.headers.authorization || ''
  const tok = h.startsWith('Bearer ') ? h.slice(7) : ''
  try { return safeEqual(tok, adminToken()) } catch { return false }
}
