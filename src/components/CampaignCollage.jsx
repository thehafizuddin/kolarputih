import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const rm = (cents) =>
  'RM ' + (Number(cents || 0) / 100).toLocaleString('en-MY', { maximumFractionDigits: 0 })

const fmtDate = (d) => {
  if (!d) return null
  const s = String(d)
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s)
  return isNaN(dt.getTime()) ? null : dt.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** One campaign tile. Used by the homepage collage and the full list. */
export function CampaignCard({ c, large }) {
  const end = fmtDate(c.ends_at)
  const pct = Math.min(100, Math.max(0, c.percent ?? 0))
  return (
    <Link to={`/c/${c.slug}`} className={`ccard ${large ? 'ccard-lg' : ''}`}>
      <div className="ccard-media">
        {c.image_url
          ? <img src={c.image_url} alt="" loading="lazy" />
          : <div className="ccard-blank"><span className="ms">{c.icon || 'volunteer_activism'}</span></div>}
        {c.is_featured && <span className="ccard-flag">Featured</span>}
        {!c.is_open && <span className="ccard-closed">Closed</span>}
      </div>

      <div className="ccard-body">
        <span className="ms ccard-icon">{c.icon || 'volunteer_activism'}</span>
        <h3>{c.title}</h3>
        {c.blurb && <p>{c.blurb}</p>}

        {c.show_progress && c.goal_cents > 0 && (
          <div className="ccard-prog">
            <div className="prog-track slim"><div className="prog-fill" style={{ width: pct + '%' }} /></div>
            <div className="ccard-nums">
              <span><b>{rm(c.raised_cents)}</b> of {rm(c.goal_cents)}</span>
              <span className="ccard-pct">{pct}%</span>
            </div>
          </div>
        )}

        <div className="ccard-foot">
          {end && c.is_open && <span className="ccard-end"><span className="ms">schedule</span> Ends {end}</span>}
          <span className="ccard-go">
            {c.is_open ? 'Donate' : 'View'} <span className="ms">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Homepage collage. Shows up to `limit` open campaigns; the first one takes
 * the wide slot so the layout has rhythm rather than a uniform grid.
 */
export function CampaignCollage({ limit = 4 }) {
  const [list, setList] = useState(null)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((d) => setList(d.campaigns || []))
      .catch(() => setList([]))
  }, [])

  if (list === null) return null
  if (list.length === 0) return null

  const shown = list.slice(0, limit)

  return (
    <section className="sec sec-dark" id="campaigns">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Open Appeals</span>
          <h2>Give Where It Is Needed Now.</h2>
          <p>
            Each appeal has its own goal and its own end date. Pick the one that speaks to you —
            every ringgit is tracked and reported.
          </p>
        </Reveal>

        <div className="collage" data-count={Math.min(shown.length, 4)}>
          {shown.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90} className={i === 0 && shown.length > 2 ? 'collage-lead' : ''}>
              <CampaignCard c={c} large={i === 0 && shown.length > 2} />
            </Reveal>
          ))}
        </div>

        <Reveal className="collage-more" delay={shown.length * 90}>
          <Link to="/campaigns" className="btn btn-outline">
            See All Appeals <span className="ms">arrow_forward</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/** /campaigns — every active appeal. */
export default function Campaigns() {
  const [list, setList] = useState(null)

  useEffect(() => {
    fetch('/api/campaigns?all=1')
      .then((r) => r.json())
      .then((d) => setList(d.campaigns || []))
      .catch(() => setList([]))
  }, [])

  const open = (list || []).filter((c) => c.is_open)
  const closed = (list || []).filter((c) => !c.is_open)

  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker">Campaigns</span>
          <h1>Open Appeals.</h1>
          <p>
            Every appeal we are running right now. Each one closes on its own date, so what you
            see here is what is live today.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          {list === null && <p className="note">Loading…</p>}

          {list !== null && open.length === 0 && (
            <div className="thanks" style={{ padding: '20px 0 40px' }}>
              <div className="icon"><span className="ms">volunteer_activism</span></div>
              <h1 style={{ fontSize: 'clamp(24px,3.2vw,38px)' }}>No Open Appeals Right Now.</h1>
              <p>
                We are between campaigns. You can still give to our general fund and it will go
                to the most urgent need.
              </p>
              <Link to="/donate" className="btn btn-chrome">Give To General Fund</Link>
            </div>
          )}

          {open.length > 0 && (
            <div className="collage" data-count={Math.min(open.length, 4)}>
              {open.map((c, i) => (
                <Reveal key={c.slug} delay={i * 70} className={i === 0 && open.length > 2 ? 'collage-lead' : ''}>
                  <CampaignCard c={c} large={i === 0 && open.length > 2} />
                </Reveal>
              ))}
            </div>
          )}

          {closed.length > 0 && (
            <>
              <h2 style={{ marginTop: 64, fontSize: 'clamp(22px,2.6vw,32px)' }}>Past Appeals</h2>
              <p className="note" style={{ marginBottom: 24, textAlign: 'left' }}>
                These have ended. Their pages stay up so you can see what was achieved.
              </p>
              <div className="collage collage-dim" data-count={Math.min(closed.length, 4)}>
                {closed.map((c) => (
                  <Reveal key={c.slug}><CampaignCard c={c} /></Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
