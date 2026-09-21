import { query, one, json, readBody } from './_db.js'
import { decryptSecret } from './_crypto.js'

/**
 * POST /api/chip-webhook
 * CHIP calls this after a payment settles.
 *
 * SECURITY: this endpoint is public and unauthenticated, so the request body
 * is treated as UNTRUSTED. It is only used to learn WHICH purchase to look up.
 * The authoritative status always comes from a server-to-server GET against
 * CHIP using our own secret key. If verification fails, nothing is written.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })

  let body
  try { body = await readBody(req) } catch { return json(res, 400, { error: 'bad_payload' }) }

  const purchaseId = body?.id || body?.purchase_id
  const ref = body?.reference
  if (!purchaseId && !ref) return json(res, 400, { error: 'missing_identifier' })

  let settings
  try { settings = await one('select * from site_settings where id = 1') }
  catch { return json(res, 500, { error: 'database_unavailable' }) }

  if (!settings?.chip_enabled) return json(res, 200, { ok: true, ignored: 'disabled' })

  let secret
  try { secret = decryptSecret(settings.chip_secret_key) }
  catch { return json(res, 500, { error: 'key_unreadable' }) }
  if (!secret) return json(res, 500, { error: 'key_missing' })

  // ---- find our donation row -------------------------------------------
  // Prefer the purchase id (unguessable and tied to us); fall back to the
  // reference only to locate the row — never to obtain a status.
  let donation = null
  try {
    if (purchaseId) {
      donation = await one('select * from donations where chip_purchase_id = $1', [purchaseId])
    }
    if (!donation && ref) {
      donation = await one('select * from donations where id = $1', [ref])
    }
  } catch (e) {
    console.error('lookup failed:', e.message)
    return json(res, 500, { error: 'lookup_failed' })
  }

  if (!donation) return json(res, 200, { ok: true, ignored: 'unknown_donation' })

  // ---- AUTHORITATIVE verification against CHIP -------------------------
  // We look the purchase up with our own key. The callback body NEVER supplies
  // the status. No verification -> no write.
  const lookupId = donation.chip_purchase_id
  if (!lookupId) {
    return json(res, 200, { ok: true, ignored: 'no_purchase_on_record' })
  }

  let verified = null
  try {
    const r = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${lookupId}/`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (r.ok) verified = await r.json()
    else console.error('verify rejected:', r.status, (await r.text()).slice(0, 200))
  } catch (e) {
    console.error('verify fetch failed:', e.message)
  }

  if (!verified) {
    // Could not confirm with the gateway → do not touch the row.
    return json(res, 200, { ok: true, ignored: 'unverified' })
  }

  // Cross-check: the purchase CHIP returned must belong to this donation.
  if (verified.reference && verified.reference !== String(donation.id)) {
    console.error('reference mismatch', verified.reference, donation.id)
    return json(res, 200, { ok: true, ignored: 'reference_mismatch' })
  }

  // Cross-check the amount so a tampered checkout can't underpay a big pledge.
  const paidCents = verified.purchase?.total ?? verified.amount
  if (typeof paidCents === 'number' && paidCents < donation.amount_cents) {
    console.error('amount mismatch', paidCents, donation.amount_cents)
    await query(
      `update donations set status='failed', raw_payload=$2 where id=$1`,
      [donation.id, JSON.stringify(verified)]
    )
    return json(res, 200, { ok: true, ignored: 'amount_mismatch' })
  }

  const status = verified.status            // <-- from CHIP only
  const paid = status === 'paid'

  try {
    if (paid) {
      // Never downgrade a paid row.
      await query(
        `update donations
            set status='paid',
                paid_at=coalesce(paid_at, now()),
                raw_payload=$2
          where id=$1 and status <> 'paid'`,
        [donation.id, JSON.stringify(verified)]
      )
    } else if (status === 'failed' || status === 'cancelled') {
      await query(
        `update donations
            set status=case when status='paid' then 'paid' else $2 end,
                raw_payload=$3
          where id=$1`,
        [donation.id, status, JSON.stringify(verified)]
      )
    }
    // any other status (created/viewed/held) is intentionally ignored
  } catch (e) {
    console.error('webhook update failed:', e.message)
    return json(res, 500, { error: 'update_failed' })
  }

  return json(res, 200, { ok: true, status })
}
