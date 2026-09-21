import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const PRESETS = [10, 50, 100, 500]

const rm = (cents) =>
  'RM ' + (Number(cents || 0) / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })

// Accepts either "YYYY-MM-DD" or a full ISO timestamp from the API.
const fmtDate = (d) => {
  if (!d) return null
  const s = String(d)
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s)
  if (isNaN(dt.getTime())) return null
  return dt.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ProgressBar({ raised, goal, percent }) {
  if (!goal) return null
  const pct = Math.min(100, Math.max(0, percent ?? 0))
  return (
    <div className="prog">
      <div className="prog-nums">
        <span><b>{rm(raised)}</b> raised</span>
        <span className="prog-of">of {rm(goal)} goal</span>
      </div>
      <div className="prog-track"><div className="prog-fill" style={{ width: pct + '%' }} /></div>
      <div className="prog-pct">{pct}% funded</div>
    </div>
  )
}

/** The donate box, scoped to one campaign. */
function CampaignDonate({ campaign }) {
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '', anonymous: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [gatewayOpen, setGatewayOpen] = useState(null)

  useEffect(() => {
    fetch('/api/campaigns').then((r) => r.json())
      .then((d) => setGatewayOpen(d.gateway_open !== false)).catch(() => {})
  }, [])

  const finalAmount = useCustom ? Number(custom) : amount

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!Number.isFinite(finalAmount) || finalAmount < 1) {
      return setErr('Please enter an amount of at least RM1.')
    }
    setBusy(true)
    try {
      const r = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, amount: finalAmount, campaign: campaign.slug }),
      })
      const j = await r.json()
      if (!r.ok || !j.checkout_url) throw new Error(j.message || 'Could not start the payment.')
      window.location.href = j.checkout_url
    } catch (ex) { setErr(ex.message); setBusy(false) }
  }

  return (
    <form className="donate-form camp-donate" onSubmit={submit} id="give">
      <span className="ad-label" style={{ marginTop: 0 }}>Choose an amount</span>
      <div className="amount-row">
        {PRESETS.map((p) => (
          <button type="button" key={p}
            className={`amount-btn ${!useCustom && amount === p ? 'on' : ''}`}
            onClick={() => { setAmount(p); setUseCustom(false) }}>RM{p}</button>
        ))}
      </div>

      <button type="button" className={`ad-switch small ${useCustom ? 'on' : ''}`}
              onClick={() => setUseCustom((v) => !v)}>
        <span className="ad-knob" /><span>Enter my own amount</span>
      </button>
      {useCustom && (
        <div className="donate-custom">
          <span>RM</span>
          <input className="ad-input" type="number" min="1" step="1" value={custom}
                 onChange={(e) => setCustom(e.target.value)} placeholder="e.g. 250" autoFocus />
        </div>
      )}

      <div className="ad-grid2">
        <div>
          <label className="ad-label">Full name{f.anonymous ? ' (not needed)' : ''}</label>
          <input className="ad-input" value={f.name} disabled={f.anonymous} required={!f.anonymous}
                 onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your full name" />
        </div>
        <div>
          <label className="ad-label">Email</label>
          <input className="ad-input" type="email" required value={f.email}
                 onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@email.com" />
        </div>
      </div>

      <div>
        <label className="ad-label">Phone (optional)</label>
        <input className="ad-input" type="tel" inputMode="tel" value={f.phone}
               onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0123456789" />
      </div>

      <div>
        <label className="ad-label">Message (optional)</label>
        <input className="ad-input" value={f.message}
               onChange={(e) => setF({ ...f, message: e.target.value })}
               placeholder="A note for the team" />
      </div>

      <label className="chk">
        <input type="checkbox" checked={f.anonymous}
               onChange={(e) => setF({ ...f, anonymous: e.target.checked })} />
        Donate anonymously — hide my name from the record
      </label>

      {gatewayOpen === false && (
        <div className="ad-warn">
          <b>Online donations are not open yet.</b> Email us at{' '}
          <a href="mailto:unitednation.kolarputih@gmail.com">unitednation.kolarputih@gmail.com</a>{' '}
          and we will arrange it directly.
        </div>
      )}
      {err && <div className="ad-err">{err}</div>}

      <button type="submit" className="ad-btn ad-btn-primary" disabled={busy || gatewayOpen === false}
              style={{ padding: '19px 30px', fontSize: 16 }}>
        {gatewayOpen === false ? 'Donations Opening Soon'
          : busy ? 'Redirecting…' : `Donate RM${finalAmount > 0 ? finalAmount : '—'} Securely`}
      </button>
      <p className="note" style={{ textAlign: 'center' }}>
        You will be taken to CHIP's secure checkout. We never see your card details.
      </p>
    </form>
  )
}

/** Deep-link dropdown used elsewhere on the site. */
export function CampaignPicker() {
  const [list, setList] = useState([])
  useEffect(() => {
    fetch('/api/campaigns').then((r) => r.json())
      .then((d) => setList(d.campaigns || [])).catch(() => {})
  }, [])
  if (list.length < 2) return null
  return (
    <div className="camp-grid">
      {list.map((c) => (
        <Link key={c.slug} to={`/c/${c.slug}`} className="camp-btn">
          <span className="ms">{c.icon || 'volunteer_activism'}</span>
          <span>
            <b>{c.title}</b>
            {c.blurb && <span>{c.blurb}</span>}
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function Campaign() {
  const { slug } = useParams()
  const [c, setC] = useState(null)
  const [state, setState] = useState('loading')
  const [params] = useSearchParams()

  useEffect(() => {
    setState('loading')
    fetch(`/api/campaign?slug=${encodeURIComponent(slug)}`)
      .then((r) => { if (!r.ok) throw new Error('notfound'); return r.json() })
      .then((d) => { setC(d.campaign); setState('ok') })
      .catch(() => setState('notfound'))
  }, [slug])

  useEffect(() => {
    if (params.get('give') && state === 'ok') {
      setTimeout(() => document.getElementById('give')?.scrollIntoView({ behavior: 'smooth' }), 200)
    }
  }, [params, state])

  if (state === 'loading') {
    return <section className="sec"><div className="wrap"><p className="note">Loading…</p></div></section>
  }

  if (state === 'notfound') {
    return (
      <section className="sec">
        <div className="wrap thanks">
          <div className="icon"><span className="ms">search_off</span></div>
          <h1>Campaign Not Found.</h1>
          <p>This campaign may have ended or the link is incorrect.</p>
          <Link to="/" className="btn btn-chrome">Back to Home</Link>
        </div>
      </section>
    )
  }

  const closed = !c.is_open
  const endStr = fmtDate(c.ends_at)

  return (
    <>
      <section className="phero camp-hero" style={c.image_url ? {
        backgroundImage: `linear-gradient(180deg, rgba(11,12,13,.86), rgba(11,12,13,.94)), url(${c.image_url})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      } : undefined}>
        <div className="wrap">
          <span className="kicker">{closed ? 'Campaign Closed' : 'Campaign'}</span>
          <h1>{c.title}</h1>
          {c.blurb && <p>{c.blurb}</p>}
          {c.ends_at && !closed && endStr && (
            <p className="camp-ends">
              <span className="ms">schedule</span> Ends {endStr}
            </p>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="wrap camp-layout">
          <div className="camp-main">
            {c.show_progress && c.goal_cents > 0 && (
              <Reveal>
                <ProgressBar raised={c.raised_cents} goal={c.goal_cents} percent={c.percent} />
              </Reveal>
            )}

            {(fmtDate(c.starts_at) || fmtDate(c.ends_at)) && (
              <div className="camp-meta" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <span className="ms">event</span>
                {fmtDate(c.starts_at) ? `Runs from ${fmtDate(c.starts_at)}` : 'Runs'}
                {fmtDate(c.ends_at) ? ` to ${fmtDate(c.ends_at)}` : ''}
              </div>
            )}

            <div className="camp-story" style={{ marginTop: 34 }}>
              {c.story
                ? String(c.story).split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
                : <p>{c.blurb || 'Support this cause and help us reach more people in need.'}</p>}
            </div>

            {c.donor_count > 0 && (
              <div className="camp-meta">
                <span className="ms">favorite</span>
                {c.donor_count} {c.donor_count === 1 ? 'person has' : 'people have'} given to this campaign
              </div>
            )}
          </div>

          <aside className="camp-side">
            <div className="camp-box">
              {closed ? (
                <>
                  <span className="ad-label" style={{ marginTop: 0 }}>Campaign closed</span>
                  <p className="note" style={{ textAlign: 'left', marginBottom: 18 }}>
                    This campaign is no longer accepting online donations. You can still support
                    our ongoing work.
                  </p>
                  <Link to="/donate" className="btn btn-chrome" style={{ width: '100%' }}>
                    Give To General Fund
                  </Link>
                </>
              ) : (
                <>
                  <span className="ad-label" style={{ marginTop: 0 }}>Donate to this campaign</span>
                  <CampaignDonate campaign={c} />
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
