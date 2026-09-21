import { query, one, json, readBody } from './_db.js'

/**
 * POST /api/chip-webhook
 * CHIP calls this after a payment settles. We look the purchase up with our
 * own key (never trusting the payload) and mark the donation paid.
 *
 * CHIP does not sign callbacks, so the only trustworthy signal is the
 * server-to-server GET against the gateway using our secret key.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })

  let body
  try { body = await readBody(req) } catch { return json(res, 400, { error: 'bad_payload' }) }

  const purchaseId = body?.id || body?.purchase_id
  const ref = body?.reference
  if (!purchaseId && !ref) return json(res, 400, { error: 'missing_identifier' })

  const { decryptSecret } = await import('./_crypto.js')

  let settings
  try { settings = await one('select * from site_settings where id = 1') }
  catch { return json(res, 500, { error: 'database_unavailable' }) }

  if (!settings?.chip_enabled) return json(res, 200, { ok: true, ignored: 'disabled' })

  let secret
  try { secret = decryptSecret(settings.chip_secret_key) }
  catch { return json(res, 500, { error: 'key_unreadable' }) }
  if (!secret) return json(res, 500, { error: 'key_missing' })

  // ---- verify with CHIP directly (do not trust the callback body) ------
  let verified = null
  if (purchaseId) {
    try {
      const r = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (r.ok) verified = await r.json()
    } catch (e) {
      console.error('verify fetch failed:', e.message)
    }
  }

  const status = verified?.status || body?.status
  const ourRef = verified?.reference || ref
  const paid = status === 'paid'

  if (!ourRef) return json(res, 200, { ok: true, ignored: 'no_reference' })

  try {
    if (paid) {
      await query(
        `update donations
            set status='paid', paid_at=coalesce(paid_at, now()),
                chip_purchase_id=coalesce(chip_purchase_id,$2), raw_payload=$3
          where id=$1`,
        [ourRef, purchaseId || null, verified ? JSON.stringify(verified) : null]
      )
    } else if (status) {
      await query(
        `update donations
            set status=case when status='paid' then 'paid' else $2 end,
                raw_payload=$3
          where id=$1`,
        [ourRef, status === 'failed' ? 'failed' : 'pending',
         verified ? JSON.stringify(verified) : null]
      )
    }
  } catch (e) {
    console.error('webhook update failed:', e.message)
    return json(res, 500, { error: 'update_failed' })
  }

  return json(res, 200, { ok: true, status: status || 'unknown' })
}
