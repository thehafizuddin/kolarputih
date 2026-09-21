import { query, one, json, readBody, requireAdmin, adminToken, safeEqual } from './_db.js'
import { encryptSecret, decryptSecret, maskSecret, hashPassword, verifyPassword } from './_crypto.js'

/**
 * /api/admin?action=...
 *   POST  setup          — first-run: set the admin password
 *   POST  login          — password → session token
 *   GET   overview       — summary + campaign list
 *   GET   donations      — paginated donation list
 *   GET   settings       — masked gateway settings
 *   POST  settings       — save CHIP key + brand id
 *   POST  campaign       — create / update a campaign
 *   POST  delete-campaign
 *   POST  manual         — record an offline donation
 *   GET   export         — CSV of all donations
 *
 * The CHIP secret key is write-only from the client's perspective: it is
 * encrypted before storage and only ever returned masked.
 */
export default async function handler(req, res) {
  const action = (req.query?.action || '').toString()
  const method = req.method

  if (method === 'OPTIONS') return json(res, 204, {})

  try {
    // ---------- public: first-run setup ----------
    if (action === 'setup' && method === 'POST') {
      const existing = await one('select id from admin_users where id = 1')
      if (existing) return json(res, 409, { error: 'already_setup' })
      const { password } = await readBody(req)
      if (!password || String(password).length < 8) {
        return json(res, 400, { error: 'weak_password', message: 'Use at least 8 characters.' })
      }
      await query('insert into admin_users (id, password_hash) values (1,$1)', [hashPassword(password)])
      return json(res, 200, { ok: true })
    }

    if (action === 'status' && method === 'GET') {
      const existing = await one('select id from admin_users where id = 1')
      return json(res, 200, { setup: Boolean(existing) })
    }

    // ---------- public: login ----------
    if (action === 'login' && method === 'POST') {
      const { password } = await readBody(req)
      const u = await one('select password_hash from admin_users where id = 1')
      if (!u || !verifyPassword(password, u.password_hash)) {
        await new Promise((r) => setTimeout(r, 400))   // slow down guessing
        return json(res, 401, { error: 'invalid_password' })
      }
      return json(res, 200, { ok: true, token: adminToken() })
    }

    // ---------- everything below needs the admin token ----------
    if (!requireAdmin(req)) return json(res, 401, { error: 'unauthorized' })

    if (action === 'overview' && method === 'GET') {
      const summary = await one('select * from donation_summary')
      const campaigns = await query(
        'select * from campaigns order by sort_order, title'
      )
      const recent = await query(
        `select id, created_at, donor_name, donor_email, amount_cents, campaign,
                status, is_anonymous, source
           from donations order by created_at desc limit 5`
      )
      const settings = await one('select * from site_settings where id = 1')
      return json(res, 200, {
        summary, campaigns, recent,
        gateway: {
          enabled: settings?.chip_enabled || false,
          mode: settings?.chip_mode || 'live',
          brand_id: settings?.chip_brand_id || '',
          key_masked: maskSecret(safeDecrypt(settings?.chip_secret_key)),
          key_set: Boolean(settings?.chip_secret_key),
        },
      })
    }

    if (action === 'donations' && method === 'GET') {
      const limit = Math.min(Number(req.query.limit) || 50, 200)
      const offset = Math.max(Number(req.query.offset) || 0, 0)
      const status = (req.query.status || '').toString()
      const rows = status
        ? await query(
            `select * from donations where status=$1
              order by created_at desc limit $2 offset $3`, [status, limit, offset])
        : await query(
            `select * from donations
              order by created_at desc limit $1 offset $2`, [limit, offset])
      return json(res, 200, { donations: rows })
    }

    if (action === 'settings' && method === 'GET') {
      const s = await one('select * from site_settings where id = 1')
      return json(res, 200, {
        enabled: s?.chip_enabled || false,
        mode: s?.chip_mode || 'live',
        brand_id: s?.chip_brand_id || '',
        key_masked: maskSecret(safeDecrypt(s?.chip_secret_key)),
        key_set: Boolean(s?.chip_secret_key),
        contact_email: s?.contact_email || '',
      })
    }

    if (action === 'settings' && method === 'POST') {
      const b = await readBody(req)
      const sets = []
      const vals = []
      let i = 1

      // only re-encrypt when a new key was actually supplied
      if (typeof b.chip_secret_key === 'string' && b.chip_secret_key.trim() !== '') {
        sets.push(`chip_secret_key=$${i++}`)
        vals.push(encryptSecret(b.chip_secret_key.trim()))
      }
      if (typeof b.chip_brand_id === 'string') {
        sets.push(`chip_brand_id=$${i++}`)
        vals.push(b.chip_brand_id.trim() || null)
      }
      if (typeof b.chip_mode === 'string') {
        sets.push(`chip_mode=$${i++}`)
        vals.push(b.chip_mode === 'sandbox' ? 'sandbox' : 'live')
      }
      if (typeof b.chip_enabled === 'boolean') {
        sets.push(`chip_enabled=$${i++}`)
        vals.push(b.chip_enabled)
      }
      if (typeof b.contact_email === 'string') {
        sets.push(`contact_email=$${i++}`)
        vals.push(b.contact_email.trim() || null)
      }
      if (!sets.length) return json(res, 400, { error: 'nothing_to_update' })

      sets.push('updated_at=now()')
      vals.push(1)
      await query(`update site_settings set ${sets.join(', ')} where id=$${i}`, vals)
      return json(res, 200, { ok: true })
    }

    // quick connectivity test against CHIP with the stored key
    if (action === 'test-gateway' && method === 'POST') {
      const s = await one('select * from site_settings where id = 1')
      let secret
      try { secret = decryptSecret(s?.chip_secret_key) } catch { return json(res, 400, { error: 'key_unreadable' }) }
      if (!secret || !s?.chip_brand_id) return json(res, 400, { error: 'not_configured' })
      try {
        const r = await fetch(
          `https://gate.chip-in.asia/api/v1/payment_methods/?brand_id=${encodeURIComponent(s.chip_brand_id)}&currency=MYR&amount=1000`,
          { headers: { Authorization: `Bearer ${secret}` } }
        )
        const j = await r.json().catch(() => ({}))
        if (!r.ok) return json(res, 200, { ok: false, status: r.status, detail: j?.detail || j?.message || 'rejected' })
        return json(res, 200, { ok: true, methods: (j.available_payment_methods || []).slice(0, 12) })
      } catch (e) {
        return json(res, 200, { ok: false, detail: e.message })
      }
    }

    if (action === 'campaign' && method === 'POST') {
      const b = await readBody(req)
      const title = String(b.title || '').trim().slice(0, 120)
      if (!title) return json(res, 400, { error: 'title_required' })
      const slug = (b.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
      const goal = b.goal_cents ? Math.max(0, Math.round(Number(b.goal_cents))) : null
      if (b.id) {
        await query(
          `update campaigns set title=$2, slug=$3, blurb=$4, icon=$5,
                  goal_cents=$6, active=$7, sort_order=$8 where id=$1`,
          [b.id, title, slug, (b.blurb || '').slice(0, 300) || null,
           b.icon || 'volunteer_activism', goal,
           b.active !== false, Number(b.sort_order) || 100]
        )
      } else {
        await query(
          `insert into campaigns (title, slug, blurb, icon, goal_cents, active, sort_order)
           values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (slug) do update set title=excluded.title, blurb=excluded.blurb`,
          [title, slug, (b.blurb || '').slice(0, 300) || null,
           b.icon || 'volunteer_activism', goal, b.active !== false, Number(b.sort_order) || 100]
        )
      }
      return json(res, 200, { ok: true, slug })
    }

    if (action === 'delete-campaign' && method === 'POST') {
      const b = await readBody(req)
      if (!b.id) return json(res, 400, { error: 'id_required' })
      const used = await one('select count(*)::int as n from donations where campaign = (select slug from campaigns where id=$1)', [b.id])
      if (used?.n > 0) {
        await query('update campaigns set active=false where id=$1', [b.id])
        return json(res, 200, { ok: true, deactivated: true, donations: used.n })
      }
      await query('delete from campaigns where id=$1 and slug <> $2', [b.id, 'general'])
      return json(res, 200, { ok: true })
    }

    if (action === 'manual' && method === 'POST') {
      const b = await readBody(req)
      const amount = Number(b.amount)
      if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: 'invalid_amount' })
      await query(
        `insert into donations
           (donor_name, donor_email, donor_phone, amount_cents, campaign, message,
            is_anonymous, gateway, status, paid_at, source)
         values ($1,$2,$3,$4,$5,$6,$7,'manual','paid',now(),'manual')`,
        [b.name || null, b.email || null, b.phone || null, Math.round(amount * 100),
         b.campaign || 'general', b.message || null, Boolean(b.anonymous)]
      )
      return json(res, 200, { ok: true })
    }

    if (action === 'export' && method === 'GET') {
      const rows = await query('select * from donations order by created_at desc')
      const cols = ['id', 'created_at', 'donor_name', 'donor_email', 'donor_phone',
        'amount_cents', 'currency', 'campaign', 'status', 'source',
        'chip_purchase_id', 'paid_at', 'is_anonymous', 'message']
      const esc = (v) => {
        if (v === null || v === undefined) return ''
        const s = String(v).replace(/"/g, '""')
        return /[",\n]/.test(s) ? `"${s}"` : s
      }
      const csv = [cols.join(',')]
        .concat(rows.map((r) => cols.map((c) => esc(r[c])).join(',')))
        .join('\n')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="kolarputih-donations.csv"')
      res.setHeader('Cache-Control', 'no-store')
      return res.end(csv)
    }

    return json(res, 400, { error: 'unknown_action', action })
  } catch (e) {
    console.error('admin error:', e.message)
    return json(res, 500, { error: 'server_error', detail: e.message })
  }
}

/** decrypt that never throws — used only for producing a masked hint. */
function safeDecrypt(v) {
  if (!v) return null
  try { return decryptSecret(v) } catch { return null }
}
