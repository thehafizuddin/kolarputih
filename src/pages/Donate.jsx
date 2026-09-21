import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const PRESETS = [10, 50, 100, 500]

function PublicDonate() {
  const [params] = useSearchParams()
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [campaign, setCampaign] = useState(params.get('campaign') || 'general')
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '', anonymous: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((d) => { if (d.campaigns?.length) setCampaigns(d.campaigns) })
      .catch(() => {})
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
        body: JSON.stringify({ ...f, amount: finalAmount, campaign }),
      })
      const j = await r.json()
      if (!r.ok || !j.checkout_url) {
        throw new Error(j.message || 'Could not start the payment. Please try again.')
      }
      window.location.href = j.checkout_url
    } catch (ex) {
      setErr(ex.message)
      setBusy(false)
    }
  }

  const active = campaigns.filter((c) => c.active !== false)

  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker">Donate</span>
          <h1>Give With Confidence.</h1>
          <p>
            Choose an amount and tell us what it should support. You will be taken to CHIP's
            secure checkout — we never see or store your card details.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="donate-shell">
    <form className="donate-form" onSubmit={submit}>
      {/* ---- amount ---- */}
      <div>
        <label className="ad-label">Choose an amount</label>
        <div className="amount-row">
          {PRESETS.map((p) => (
            <button type="button" key={p}
              className={`amount-btn ${!useCustom && amount === p ? 'on' : ''}`}
              onClick={() => { setAmount(p); setUseCustom(false) }}>
              RM{p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button type="button" className={`ad-switch small ${useCustom ? 'on' : ''}`}
                onClick={() => setUseCustom((v) => !v)}>
          <span className="ad-knob" /><span>Enter my own amount</span>
        </button>
        {useCustom && (
          <div className="donate-custom" style={{ marginTop: 12 }}>
            <span>RM</span>
            <input className="ad-input" type="number" min="1" step="1" value={custom}
                   onChange={(e) => setCustom(e.target.value)} placeholder="e.g. 250" autoFocus />
          </div>
        )}
      </div>

      {/* ---- campaign ---- */}
      {active.length > 0 && (
        <div>
          <label className="ad-label">What should it support?</label>
          <div className="camp-grid">
            {active.map((c) => (
              <button type="button" key={c.slug}
                className={`camp-btn ${campaign === c.slug ? 'on' : ''}`}
                onClick={() => setCampaign(c.slug)}>
                <span className="ms">{c.icon || 'volunteer_activism'}</span>
                <span>
                  <b>{c.title}</b>
                  {c.blurb && <span>{c.blurb}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- details ---- */}
      <div className="ad-grid2">
        <div>
          <label className="ad-label">Full name</label>
          <input className="ad-input" value={f.name} disabled={f.anonymous}
                 onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name" />
        </div>
        <div>
          <label className="ad-label">Email</label>
          <input className="ad-input" type="email" required value={f.email}
                 onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@email.com" />
        </div>
      </div>

      <div>
        <label className="ad-label">Phone (optional)</label>
        <input className="ad-input" value={f.phone}
               onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+60…" />
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

      {err && <div className="ad-err">{err}</div>}

      <button type="submit" className="ad-btn ad-btn-primary" disabled={busy}
              style={{ padding: '19px 30px', fontSize: 16 }}>
        {busy ? 'Redirecting…' : `Donate RM${finalAmount > 0 ? finalAmount : '—'} Securely`}
      </button>

      <p className="note" style={{ textAlign: 'center' }}>
        You will be taken to CHIP's secure checkout. We never see your card details.
      </p>
    </form>
          </div>
        </div>
      </section>
    </>
  )
}

export function ThankYou() {
  const [params] = useSearchParams()
  const ref = params.get('ref') || ''
  return (
    <section className="sec">
      <div className="wrap thanks">
        <div className="icon"><span className="ms">favorite</span></div>
        <h1>Thank You.</h1>
        <p>
          Your donation is being confirmed by the payment gateway. You will receive a receipt by
          email shortly. Jazakallahu khairan — your kindness reaches someone tonight.
        </p>
        {ref && <div className="ref">Reference: {ref.slice(0, 18)}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-chrome">Back to Home</Link>
          <Link to="/milestone" className="btn btn-outline">See Our Milestone</Link>
        </div>
      </div>
    </section>
  )
}

export default PublicDonate
