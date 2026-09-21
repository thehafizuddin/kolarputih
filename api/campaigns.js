import { one, json } from './_db.js'
import { query } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' })
  try {
    const settings = await one('select chip_enabled from site_settings where id = 1')
    const campaigns = await query(
      `select slug, title, blurb, icon, goal_cents, active
         from campaigns
        where active = true
        order by sort_order, title`
    )
    return json(res, 200, { campaigns, gateway_open: Boolean(settings?.chip_enabled) })
  } catch (e) {
    console.error('campaigns error:', e.message)
    return json(res, 500, { error: 'database_unavailable' })
  }
}
