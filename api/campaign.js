import { json } from './_db.js'
import { publicCampaign, publicCampaignList } from './_campaigns.js'

/**
 * GET /api/campaign?slug=derma-raya   — one campaign page
 * GET /api/campaign                    — list of open campaigns
 *                                      (or ?all=1 for every active one)
 *
 * Public and read-only. Progress figures are aggregates only — no donor
 * details ever leave the server.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' })

  const slug = (req.query?.slug || '').toString().trim()

  try {
    if (slug) {
      const c = await publicCampaign(slug)
      if (!c || !c.active) return json(res, 404, { error: 'not_found' })
      return json(res, 200, { campaign: c })
    }
    const list = await publicCampaignList()
    const onlyOpen = req.query?.all !== '1'
    return json(res, 200, {
      campaigns: onlyOpen ? list.filter((c) => c.is_open) : list,
    })
  } catch (e) {
    console.error('campaign endpoint failed:', e.message)
    return json(res, 500, { error: 'database_unavailable' })
  }
}
