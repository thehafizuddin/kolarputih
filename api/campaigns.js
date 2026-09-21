import { one, json } from './_db.js'
import { publicCampaignList } from './_campaigns.js'

/**
 * GET /api/campaigns
 * Kept for the donate form: the open campaigns plus whether the gateway is on.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' })
  try {
    const settings = await one('select chip_enabled from site_settings where id = 1')
    const all = await publicCampaignList()
    return json(res, 200, {
      campaigns: all.filter((c) => c.is_open),
      gateway_open: Boolean(settings?.chip_enabled),
    })
  } catch (e) {
    console.error('campaigns error:', e.message)
    return json(res, 500, { error: 'database_unavailable' })
  }
}
