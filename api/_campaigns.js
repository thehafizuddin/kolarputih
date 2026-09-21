import { query, one, json, readBody } from './_db.js'

/**
 * GET  /api/admin?action=campaigns   — all campaigns + progress (admin)
 * POST /api/admin?action=campaign    — create or update
 * POST /api/admin?action=delete-campaign
 *
 * Kept in its own module so admin.js stays readable; exported and
 * dispatched from the main admin handler.
 */

const slugify = (s) =>
  String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export async function listCampaigns() {
  return query(`
    select c.*, p.raised_cents, p.donor_count, p.percent,
           (c.active
             and (c.starts_at is null or c.starts_at <= current_date)
             and (c.ends_at   is null or c.ends_at   >= current_date)) as is_open
      from campaigns c
      join campaign_progress p on p.id = c.id
     order by c.sort_order, c.title
  `)
}

export async function saveCampaign(b) {
  const title = String(b.title || '').trim().slice(0, 140)
  if (!title) return { error: 'title_required' }

  // slug: from an explicit value, else derived; never empty
  let slug = slugify(b.slug || title)
  if (!slug) slug = 'campaign-' + Date.now().toString(36)

  const blurb = String(b.blurb || '').trim().slice(0, 300) || null
  const story = String(b.story || '').trim().slice(0, 8000) || null
  const icon = String(b.icon || 'volunteer_activism').trim().slice(0, 40)
  const imageUrl = String(b.image_url || '').trim().slice(0, 500) || null
  const goal = b.goal_cents === '' || b.goal_cents === null || b.goal_cents === undefined
    ? null
    : Math.max(0, Math.round(Number(b.goal_cents)))
  const startsAt = b.starts_at || null
  const endsAt = b.ends_at || null

  if (startsAt && endsAt && startsAt > endsAt) {
    return { error: 'dates_reversed', message: 'The start date is after the end date.' }
  }

  const showProgress = b.show_progress !== false
  const isFeatured = Boolean(b.is_featured)
  const active = b.active !== false
  const sortOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 100

  try {
    if (b.id) {
      const clash = await one('select id from campaigns where slug=$1 and id<>$2', [slug, b.id])
      if (clash) return { error: 'slug_taken', message: `The link "${slug}" is already used.` }
      await query(
        `update campaigns set title=$2, slug=$3, blurb=$4, story=$5, icon=$6,
                image_url=$7, goal_cents=$8, starts_at=$9, ends_at=$10,
                show_progress=$11, is_featured=$12, active=$13, sort_order=$14,
                updated_at=now()
          where id=$1`,
        [b.id, title, slug, blurb, story, icon, imageUrl, goal,
         startsAt, endsAt, showProgress, isFeatured, active, sortOrder]
      )
    } else {
      const clash = await one('select id from campaigns where slug=$1', [slug])
      if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
      await query(
        `insert into campaigns
           (title, slug, blurb, story, icon, image_url, goal_cents,
            starts_at, ends_at, show_progress, is_featured, active, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [title, slug, blurb, story, icon, imageUrl, goal,
         startsAt, endsAt, showProgress, isFeatured, active, sortOrder]
      )
    }
    return { ok: true, slug }
  } catch (e) {
    console.error('saveCampaign failed:', e.message)
    return { error: 'save_failed', message: e.message }
  }
}

export async function removeCampaign(id) {
  if (!id) return { error: 'id_required' }
  const used = await one(
    `select count(*)::int as n from donations d
      join campaigns c on c.slug = d.campaign
     where c.id = $1`, [id])
  if (used?.n > 0) {
    // never orphan donation history — hide it instead
    await query('update campaigns set active=false, updated_at=now() where id=$1', [id])
    return { ok: true, deactivated: true, donations: used.n }
  }
  await query('delete from campaigns where id=$1', [id])
  return { ok: true }
}

/** Public: the campaign page payload. */
export async function publicCampaign(slug) {
  return one('select * from campaigns_public where slug = $1', [slug])
}

export async function publicCampaignList() {
  return query(`
    select slug, title, blurb, icon, image_url, goal_cents, starts_at, ends_at,
           show_progress, is_featured, raised_cents, donor_count, percent, is_open
      from campaigns_public
     where active = true
     order by is_featured desc, sort_order, title
  `)
}
