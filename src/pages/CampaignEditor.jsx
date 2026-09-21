import { useState } from 'react'

const rm = (cents) =>
  'RM ' + (Number(cents || 0) / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })

const today = () => new Date().toISOString().slice(0, 10)

const ICONS = [
  'volunteer_activism', 'restaurant', 'checkroom', 'child_care', 'menu_book',
  'mosque', 'celebration', 'favorite', 'school', 'local_shipping',
  'water_drop', 'medical_services', 'home', 'handshake',
]

const blank = () => ({
  id: null, title: '', slug: '', blurb: '', story: '', icon: 'volunteer_activism',
  image_url: '', goal: '', starts_at: today(), ends_at: '', show_progress: true,
  is_featured: false, active: true, sort_order: 100,
})

/**
 * Create / edit a campaign. This is what Apeh opens every time a new
 * appeal goes live ("Derma Raya", "Anak Yatim", ...).
 */
export default function CampaignEditor({ token, campaigns, onChanged, onNotify }) {
  const [form, setForm] = useState(blank())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const edit = (c) => {
    setForm({
      id: c.id, title: c.title, slug: c.slug, blurb: c.blurb || '',
      story: c.story || '', icon: c.icon || 'volunteer_activism',
      image_url: c.image_url || '',
      goal: c.goal_cents ? String(c.goal_cents / 100) : '',
      starts_at: c.starts_at ? String(c.starts_at).slice(0, 10) : '',
      ends_at: c.ends_at ? String(c.ends_at).slice(0, 10) : '',
      show_progress: c.show_progress !== false,
      is_featured: Boolean(c.is_featured),
      active: c.active !== false,
      sort_order: c.sort_order ?? 100,
    })
    setErr('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async () => {
    setErr('')
    if (!form.title.trim()) return setErr('Give the campaign a title.')
    setBusy(true)
    try {
      const r = await fetch('/api/admin?action=campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          goal_cents: form.goal ? Math.round(Number(form.goal) * 100) : null,
          starts_at: form.starts_at || null,
          ends_at: form.ends_at || null,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.message || j.error || 'Could not save')
      const url = `${window.location.origin}/c/${j.slug}`
      setForm(blank())
      setCopied(url)
      onNotify?.('Campaign saved.')
      onChanged()
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  const del = async (c) => {
    if (!confirm(`Delete "${c.title}"?`)) return
    const r = await fetch('/api/admin?action=delete-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: c.id }),
    })
    const j = await r.json()
    if (j.deactivated) onNotify?.(`Hidden — it has ${j.donations} donation(s) on record.`)
    else onNotify?.('Deleted.')
    onChanged()
  }

  const copy = (slug) => {
    const url = `${window.location.origin}/c/${slug}`
    navigator.clipboard?.writeText(url)
    setCopied(url)
    onNotify?.('Link copied.')
  }

  return (
    <>
      <section className="ad-card">
        <h2 className="ad-h2">{form.id ? 'Edit Campaign' : 'Open A New Donation Campaign'}</h2>
        <p className="ad-note">
          Each campaign gets its own page and shareable link. Set an end date and the page will
          close itself automatically.
        </p>

        <div className="ad-grid2">
          <div>
            <label className="ad-label">Campaign title</label>
            <input className="ad-input" value={form.title}
                   onChange={(e) => set('title', e.target.value)}
                   placeholder="e.g. Derma Raya 2027" />
          </div>
          <div>
            <label className="ad-label">Link (leave blank to auto-generate)</label>
            <input className="ad-input" value={form.slug}
                   onChange={(e) => set('slug', e.target.value)}
                   placeholder="derma-raya-2027" />
          </div>
        </div>

        <label className="ad-label">Short description (shown in listings)</label>
        <input className="ad-input" value={form.blurb}
               onChange={(e) => set('blurb', e.target.value)}
               placeholder="One line about what this raises for" />

        <label className="ad-label">Full story (shown on the campaign page)</label>
        <textarea className="ad-input" rows={7} value={form.story}
                  onChange={(e) => set('story', e.target.value)}
                  placeholder={'Tell donors why this matters.\n\nLeave a blank line between paragraphs.'}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} />

        <div className="ad-grid2">
          <div>
            <label className="ad-label">Target amount (RM, optional)</label>
            <input className="ad-input" type="number" min="0" step="100" value={form.goal}
                   onChange={(e) => set('goal', e.target.value)} placeholder="50000" />
          </div>
          <div>
            <label className="ad-label">Banner image URL (optional)</label>
            <input className="ad-input" value={form.image_url}
                   onChange={(e) => set('image_url', e.target.value)}
                   placeholder="/campaigns/raya.jpg or https://…" />
          </div>
        </div>

        <div className="ad-grid2">
          <div>
            <label className="ad-label">Starts on</label>
            <input className="ad-input" type="date" value={form.starts_at}
                   onChange={(e) => set('starts_at', e.target.value)} />
          </div>
          <div>
            <label className="ad-label">Ends on (blank = no end date)</label>
            <input className="ad-input" type="date" value={form.ends_at} min={form.starts_at || undefined}
                   onChange={(e) => set('ends_at', e.target.value)} />
          </div>
        </div>

        <label className="ad-label">Icon</label>
        <div className="icon-grid">
          {ICONS.map((ic) => (
            <button type="button" key={ic}
              className={`icon-pick ${form.icon === ic ? 'on' : ''}`}
              onClick={() => set('icon', ic)} title={ic}>
              <span className="ms">{ic}</span>
            </button>
          ))}
        </div>

        <button type="button" className={`ad-switch small ${form.show_progress ? 'on' : ''}`}
                onClick={() => set('show_progress', !form.show_progress)}>
          <span className="ad-knob" /><span>Show the progress bar to donors</span>
        </button>

        <button type="button" className={`ad-switch small ${form.is_featured ? 'on' : ''}`}
                onClick={() => set('is_featured', !form.is_featured)}>
          <span className="ad-knob" /><span>Feature this campaign first</span>
        </button>

        <button type="button" className={`ad-switch small ${form.active ? 'on' : ''}`}
                onClick={() => set('active', !form.active)}>
          <span className="ad-knob" /><span>{form.active ? 'Visible on the site' : 'Hidden from the site'}</span>
        </button>

        {err && <div className="ad-err">{err}</div>}

        <div className="ad-actions">
          <button className="ad-btn ad-btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : form.id ? 'Save Changes' : 'Open Campaign'}
          </button>
          {form.id && (
            <>
              <button className="ad-btn ad-btn-ghost" onClick={() => setForm(blank())}>Cancel</button>
              <a className="ad-btn ad-btn-ghost" href={`/c/${form.slug}`} target="_blank" rel="noreferrer">
                Preview
              </a>
            </>
          )}
        </div>

        {copied && (
          <div className="ad-ok">
            Campaign link — share this on WhatsApp or Instagram:<br />
            <code style={{ wordBreak: 'break-all' }}>{copied}</code>
          </div>
        )}
      </section>

      <section className="ad-card">
        <h2 className="ad-h2">Your Campaigns</h2>
        {(!campaigns || campaigns.length === 0) ? (
          <p className="ad-note" style={{ textAlign: 'left' }}>
            No campaigns yet. Open your first one above.
          </p>
        ) : (
          <div className="ad-scroll">
            <table className="ad-table">
              <thead>
                <tr><th>Status</th><th>Title</th><th>Link</th><th>Raised</th><th>Dates</th><th></th></tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className={`ad-pill ${c.is_open ? 'paid' : (c.active ? 'pending' : 'failed')}`}>
                        {c.is_open ? 'open' : (c.active ? 'scheduled/ended' : 'hidden')}
                      </span>
                    </td>
                    <td>
                      <b>{c.title}</b>
                      {c.blurb && <span className="ad-dim ad-block">{c.blurb}</span>}
                    </td>
                    <td className="ad-dim">/c/{c.slug}</td>
                    <td>
                      <b className="ad-amt">{rm(c.raised_cents)}</b>
                      {c.goal_cents ? <span className="ad-dim ad-block">of {rm(c.goal_cents)}</span> : null}
                    </td>
                    <td className="ad-dim">
                      {c.starts_at ? String(c.starts_at).slice(0, 10) : '—'}
                      {' → '}
                      {c.ends_at ? String(c.ends_at).slice(0, 10) : 'open'}
                    </td>
                    <td className="ad-rowacts">
                      <button className="ad-btn ad-btn-mini" onClick={() => edit(c)}>Edit</button>
                      <button className="ad-btn ad-btn-mini" onClick={() => copy(c.slug)}>Link</button>
                      <a className="ad-btn ad-btn-mini" href={`/c/${c.slug}`} target="_blank" rel="noreferrer">View</a>
                      <button className="ad-btn ad-btn-mini danger" onClick={() => del(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
