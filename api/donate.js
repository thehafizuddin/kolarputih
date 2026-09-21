import { query, one, json, readBody } from './_db.js'
import { decryptSecret } from './_crypto.js'

const CHIP_BASE = 'https://gate.chip-in.asia/api/v1'

/**
 * POST /api/donate
 * Creates a pending donation + a CHIP purchase, returns the checkout URL.
 * The CHIP secret key never leaves this function.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })

  let body
  try { body = await readBody(req) } catch (e) { return json(res, 400, { error: e.message }) }

  const name = String(body.name || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().slice(0, 160)
  const phone = String(body.phone || '').trim().slice(0, 40)
  const campaign = String(body.campaign || 'general').trim().slice(0, 60)
  const message = String(body.message || '').trim().slice(0, 500)
  const anonymous = Boolean(body.anonymous)
  const amount = Number(body.amount)

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(res, 400, { error: 'invalid_email', message: 'Please enter a valid email address.' })
  }
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    return json(res, 400, { error: 'invalid_amount', message: 'Amount must be between RM1 and RM100,000.' })
  }

  // ---- gateway settings ------------------------------------------------
  let settings
  try {
    settings = await one('select * from site_settings where id = 1')
  } catch (e) {
    console.error('settings read failed:', e.message)
    return json(res, 500, { error: 'database_unavailable' })
  }

  if (!settings?.chip_enabled) {
    return json(res, 503, {
      error: 'gateway_disabled',
      message: 'Online donations are not open yet. Please contact us directly to donate.',
    })
  }

  let secret
  try { secret = decryptSecret(settings.chip_secret_key) } catch (e) {
    console.error('decrypt failed:', e.message)
    return json(res, 500, { error: 'gateway_key_unreadable' })
  }
  if (!secret || !settings.chip_brand_id) {
    return json(res, 500, { error: 'gateway_misconfigured' })
  }

  const amountCents = Math.round(amount * 100)
  const origin = req.headers.origin || 'https://kolarputih.vercel.app'

  // ---- donation row first (status pending) ----------------------------
  let row
  try {
    row = await one(
      `insert into donations
         (donor_name, donor_email, donor_phone, amount_cents, currency,
          campaign, message, is_anonymous, gateway, status, source)
       values ($1,$2,$3,$4,'MYR',$5,$6,$7,'chip','pending','online')
       returning id`,
      [anonymous ? null : (name || null), email, phone || null,
       amountCents, campaign, message || null, anonymous]
    )
  } catch (e) {
    console.error('donation insert failed:', e.message)
    return json(res, 500, { error: 'could_not_create_donation' })
  }

  // ---- CHIP purchase --------------------------------------------------
  let purchase
  try {
    const r = await fetch(`${CHIP_BASE}/purchases/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_id: settings.chip_brand_id,
        client: { email, full_name: anonymous ? 'Anonymous Donor' : (name || 'Donor') },
        purchase: {
          currency: 'MYR',
          products: [{
            name: campaign === 'general' ? 'Donation to Kolar Putih' : `Donation — ${campaign}`,
            price: amountCents,
            quantity: 1,
          }],
          notes: `Donation ref ${row.id}`.slice(0, 250),
        },
        reference: row.id,
        success_redirect: `${origin}/thank-you?ref=${row.id}`,
        failure_redirect: `${origin}/contact?payment=failed&ref=${row.id}`,
        success_callback: `${origin}/api/chip-webhook`,
        send_receipt: true,
      }),
    })
    purchase = await r.json()
    if (!r.ok) {
      console.error('CHIP rejected:', r.status, JSON.stringify(purchase).slice(0, 400))
      await query(`update donations set status='failed' where id=$1`, [row.id])
      return json(res, 502, {
        error: 'gateway_rejected',
        message: purchase?.detail || purchase?.message || 'Payment gateway rejected the request.',
      })
    }
  } catch (e) {
    console.error('CHIP unreachable:', e.message)
    await query(`update donations set status='failed' where id=$1`, [row.id])
    return json(res, 502, { error: 'gateway_unreachable' })
  }

  await query(
    `update donations set chip_purchase_id=$1, chip_checkout_url=$2 where id=$3`,
    [purchase.id, purchase.checkout_url, row.id]
  )

  return json(res, 200, { ok: true, ref: row.id, checkout_url: purchase.checkout_url })
}
