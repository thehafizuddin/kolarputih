import { useState, useEffect, useCallback } from 'react'

const API = '/api/admin'

const rupiah = (cents) =>
  'RM ' + (Number(cents || 0) / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const when = (ts) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

async function call(action, { method = 'GET', body, token, query } = {}) {
  const qs = new URLSearchParams({ action, ...(query || {}) }).toString()
  const r = await fetch(`${API}?${qs}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.message || j.error || `HTTP ${r.status}`)
  return j
}

/* =====================  LOGIN / SETUP  ===================== */
function Gate({ onAuth }) {
  const [mode, setMode] = useState(null)       // 'setup' | 'login'
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    call('status').then((s) => setMode(s.setup ? 'login' : 'setup')).catch(() => setMode('login'))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (mode === 'setup' && pw !== pw2) return setErr('Passwords do not match.')
    if (pw.length < 8) return setErr('Use at least 8 characters.')
    setBusy(true)
    try {
      if (mode === 'setup') {
        await call('setup', { method: 'POST', body: { password: pw } })
        const r = await call('login', { method: 'POST', body: { password: pw } })
        onAuth(r.token)
      } else {
        const r = await call('login', { method: 'POST', body: { password: pw } })
        onAuth(r.token)
      }
    } catch (ex) {
      setErr(ex.message)
    } finally { setBusy(false) }
  }

  if (!mode) return <div className="ad-wrap"><p className="ad-note">Loading…</p></div>

  return (
    <div className="ad-wrap ad-center">
      <form className="ad-card ad-login" onSubmit={submit}>
        <img src="/logo-silver.png" alt="Kolar Putih" className="ad-logo" />
        <h1 className="ad-h1">{mode === 'setup' ? 'Set Up Admin' : 'Admin Login'}</h1>
        <p className="ad-note">
          {mode === 'setup'
            ? 'Choose a password for the donation dashboard. Store it somewhere safe — it cannot be recovered.'
            : 'Enter your admin password to manage donations.'}
        </p>

        <label className="ad-label">Password</label>
        <div className="ad-pwrow">
          <input
            className="ad-input"
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
          />
          <button type="button" className="ad-eyebtn" onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}>
            <span className="ms">{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>

        {mode === 'setup' && (
          <>
            <label className="ad-label">Confirm password</label>
            <input className="ad-input" type={show ? 'text' : 'password'} value={pw2}
                   onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
          </>
        )}

        {err && <div className="ad-err">{err}</div>}
        <button className="ad-btn ad-btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'setup' ? 'Create Admin' : 'Log In'}
        </button>
      </form>
    </div>
  )
}

/* =====================  DASHBOARD  ===================== */
function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('donations')
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [flash, setFlash] = useState('')

  const load = useCallback(async () => {
    try {
      setErr('')
      setData(await call('overview', { token }))
    } catch (e) {
      if (/unauthor/i.test(e.message)) onLogout()
      else setErr(e.message)
    }
  }, [token, onLogout])

  useEffect(() => { load() }, [load])

  const say = (m) => { setFlash(m); setTimeout(() => setFlash(''), 3200) }

  if (!data) {
    return <div className="ad-wrap"><p className="ad-note">{err || 'Loading dashboard…'}</p></div>
  }

  const s = data.summary || {}
  const g = data.gateway || {}

  return (
    <div className="ad-wrap">
      <header className="ad-top">
        <div className="ad-brand">
          <img src="/logo-silver.png" alt="" />
          <span>Donation Admin</span>
        </div>
        <nav className="ad-tabs">
          {[['donations', 'Donations'], ['gateway', 'Payment Gateway'],
            ['campaigns', 'Categories'], ['manual', 'Add Offline']].map(([k, l]) => (
            <button key={k} className={`ad-tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
        <button className="ad-btn ad-btn-ghost" onClick={onLogout}>Log out</button>
      </header>

      {flash && <div className="ad-flash">{flash}</div>}

      {/* ---- summary tiles ---- */}
      <section className="ad-tiles">
        <Tile label="Total Raised" value={rupiah(s.total_paid_cents)} sub={`${s.paid_count || 0} paid donations`} big />
        <Tile label="This Month" value={rupiah(s.month_paid_cents)} sub={`${s.month_paid_count || 0} donations`} />
        <Tile label="Pending" value={String(s.pending_count || 0)} sub="awaiting payment" />
        <Tile label="Gateway" value={g.enabled ? (g.mode === 'sandbox' ? 'Test Mode' : 'Live') : 'Off'}
              sub={g.key_set ? 'key saved' : 'no key yet'} tone={g.enabled ? 'ok' : 'warn'} />
      </section>

      {tab === 'donations' && <Donations token={token} onAuth={onLogout} />}
      {tab === 'gateway' && <Gateway token={token} data={g} onSaved={() => { load(); say('Saved.') }} />}
      {tab === 'campaigns' && <Campaigns token={token} campaigns={data.campaigns} onChanged={() => { load(); say('Updated.') }} />}
      {tab === 'manual' && <Manual token={token} campaigns={data.campaigns} onAdded={() => { load(); say('Donation recorded.') }} />}
    </div>
  )
}

function Tile({ label, value, sub, big, tone }) {
  return (
    <div className={`ad-tile ${big ? 'big' : ''} ${tone ? 'tone-' + tone : ''}`}>
      <span className="ad-tile-label">{label}</span>
      <b className="ad-tile-value">{value}</b>
      <span className="ad-tile-sub">{sub}</span>
    </div>
  )
}

/* =====================  DONATIONS LIST  ===================== */
function Donations({ token, onAuth }) {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    call('donations', { token, query: filter ? { status: filter } : {} })
      .then((d) => setRows(d.donations))
      .catch((e) => { if (/unauthor/i.test(e.message)) onAuth(); else setRows([]) })
  }, [token, filter, onAuth])

  if (!rows) return <p className="ad-note">Loading donations…</p>
  if (!rows.length) return <p className="ad-note">No donations {filter ? `with status “${filter}”` : 'yet'}.</p>

  return (
    <>
      <div className="ad-rowbar">
        <div className="ad-filters">
          {['', 'paid', 'pending', 'failed'].map((f) => (
            <button key={f} className={`ad-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
              {f || 'All'}
            </button>
          ))}
        </div>
        <a className="ad-btn ad-btn-ghost" href={`${API}?action=export`}
           onClick={(e) => { e.preventDefault(); exportCsv(token) }}>Export CSV</a>
      </div>
      <div className="ad-scroll">
        <table className="ad-table">
          <thead>
            <tr><th>Date</th><th>Donor</th><th>Amount</th><th>Category</th><th>Status</th><th>Source</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="ad-dim">{when(r.created_at)}</td>
                <td>
                  <b>{r.is_anonymous ? 'Anonymous' : (r.donor_name || '—')}</b>
                  <span className="ad-dim ad-block">{r.donor_email || ''}</span>
                </td>
                <td className="ad-amt">{rupiah(r.amount_cents)}</td>
                <td>{r.campaign}</td>
                <td><span className={`ad-pill ${r.status}`}>{r.status}</span></td>
                <td className="ad-dim">{r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

async function exportCsv(token) {
  const r = await fetch(`${API}?action=export`, { headers: { Authorization: `Bearer ${token}` } })
  const b = await r.blob()
  const u = URL.createObjectURL(b)
  const a = document.createElement('a')
  a.href = u
  a.download = `kolarputih-donations-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(u)
}

/* =====================  GATEWAY SETTINGS  ===================== */
function Gateway({ token, data, onSaved }) {
  const [key, setKey] = useState('')
  const [brand, setBrand] = useState(data.brand_id || '')
  const [mode, setMode] = useState(data.mode || 'live')
  const [enabled, setEnabled] = useState(Boolean(data.enabled))
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [test, setTest] = useState(null)

  const save = async () => {
    setBusy(true); setErr('')
    try {
      const body = { chip_brand_id: brand, chip_mode: mode, chip_enabled: enabled }
      if (key.trim()) body.chip_secret_key = key.trim()
      await call('settings', { method: 'POST', token, body })
      setKey('')
      onSaved()
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  const runTest = async () => {
    setTest({ busy: true })
    try { setTest(await call('test-gateway', { method: 'POST', token })) }
    catch (e) { setTest({ ok: false, detail: e.message }) }
  }

  return (
    <section className="ad-card">
      <h2 className="ad-h2">CHIP Payment Gateway</h2>
      <p className="ad-note">
        Paste the API key from your CHIP merchant portal. It is encrypted before it is stored and is
        never shown again in full.
      </p>

      <div className="ad-grid2">
        <div>
          <label className="ad-label">Secret Key</label>
          <div className="ad-pwrow">
            <input className="ad-input" type={show ? 'text' : 'password'} value={key}
                   onChange={(e) => setKey(e.target.value)}
                   placeholder={data.key_set ? `saved (${data.key_masked}) — type to replace` : 'paste your CHIP secret key'} />
            <button type="button" className="ad-eyebtn" onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide key' : 'Show key'}>
              <span className="ms">{show ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        <div>
          <label className="ad-label">Brand ID</label>
          <input className="ad-input" value={brand} onChange={(e) => setBrand(e.target.value)}
                 placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </div>
      </div>

      <div className="ad-grid2">
        <div>
          <label className="ad-label">Mode</label>
          <select className="ad-input" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="live">Live — real payments</option>
            <option value="sandbox">Sandbox — test payments</option>
          </select>
        </div>
        <div>
          <label className="ad-label">Accepting donations</label>
          <button type="button" className={`ad-switch ${enabled ? 'on' : ''}`}
                  onClick={() => setEnabled((v) => !v)}>
            <span className="ad-knob" />
            <span>{enabled ? 'Online donations are OPEN' : 'Online donations are CLOSED'}</span>
          </button>
        </div>
      </div>

      {err && <div className="ad-err">{err}</div>}

      <div className="ad-actions">
        <button className="ad-btn ad-btn-primary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save Settings'}
        </button>
        <button className="ad-btn ad-btn-ghost" onClick={runTest} disabled={!data.key_set}>
          Test Connection
        </button>
      </div>

      {test && !test.busy && (
        <div className={test.ok ? 'ad-ok' : 'ad-err'}>
          {test.ok
            ? <>Connected. Available methods: <b>{(test.methods || []).join(', ') || 'none reported'}</b></>
            : <>Failed: {test.detail || 'unknown error'}{test.status ? ` (HTTP ${test.status})` : ''}</>}
        </div>
      )}

      <details className="ad-help">
        <summary>Where do I find these?</summary>
        <ol>
          <li>Log in to <b>portal.chip-in.asia</b></li>
          <li>Go to <b>Developers → API Keys</b> and create a key</li>
          <li>Copy the <b>Secret Key</b> and the <b>Brand ID</b></li>
          <li>Paste both above, then press <b>Test Connection</b></li>
          <li>In CHIP, set the webhook URL to <code>{typeof window !== 'undefined' ? window.location.origin : ''}/api/chip-webhook</code></li>
        </ol>
      </details>
    </section>
  )
}

/* =====================  CAMPAIGNS  ===================== */
function Campaigns({ token, campaigns, onChanged }) {
  const [form, setForm] = useState({ title: '', blurb: '', goal: '', icon: 'volunteer_activism' })
  const [err, setErr] = useState('')

  const add = async () => {
    setErr('')
    if (!form.title.trim()) return setErr('Title is required.')
    try {
      await call('campaign', {
        method: 'POST', token,
        body: {
          title: form.title, blurb: form.blurb, icon: form.icon,
          goal_cents: form.goal ? Math.round(Number(form.goal) * 100) : null,
        },
      })
      setForm({ title: '', blurb: '', goal: '', icon: 'volunteer_activism' })
      onChanged()
    } catch (e) { setErr(e.message) }
  }

  const toggle = async (c) => {
    await call('campaign', {
      method: 'POST', token,
      body: { id: c.id, title: c.title, slug: c.slug, blurb: c.blurb, icon: c.icon,
              goal_cents: c.goal_cents, active: !c.active, sort_order: c.sort_order },
    })
    onChanged()
  }

  const remove = async (c) => {
    if (!confirm(`Remove “${c.title}”?`)) return
    await call('delete-campaign', { method: 'POST', token, body: { id: c.id } })
    onChanged()
  }

  return (
    <section className="ad-card">
      <h2 className="ad-h2">Donation Categories</h2>
      <p className="ad-note">These appear as the giving options on the public donate form.</p>

      <div className="ad-scroll">
        <table className="ad-table">
          <thead><tr><th>Order</th><th>Title</th><th>Slug</th><th>Goal</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td className="ad-dim">{c.sort_order}</td>
                <td><b>{c.title}</b><span className="ad-dim ad-block">{c.blurb || ''}</span></td>
                <td className="ad-dim">{c.slug}</td>
                <td>{c.goal_cents ? rupiah(c.goal_cents) : '—'}</td>
                <td><span className={`ad-pill ${c.active ? 'paid' : 'failed'}`}>{c.active ? 'active' : 'hidden'}</span></td>
                <td className="ad-rowacts">
                  <button className="ad-btn ad-btn-mini" onClick={() => toggle(c)}>{c.active ? 'Hide' : 'Show'}</button>
                  {c.slug !== 'general' &&
                    <button className="ad-btn ad-btn-mini danger" onClick={() => remove(c)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="ad-h3">Add a category</h3>
      <div className="ad-grid2">
        <div>
          <label className="ad-label">Title</label>
          <input className="ad-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                 placeholder="e.g. Winter Clothing Drive" />
        </div>
        <div>
          <label className="ad-label">Goal (RM, optional)</label>
          <input className="ad-input" type="number" min="0" step="10" value={form.goal}
                 onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="5000" />
        </div>
      </div>
      <label className="ad-label">Short description</label>
      <input className="ad-input" value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })}
             placeholder="One line shown under the category" />
      {err && <div className="ad-err">{err}</div>}
      <div className="ad-actions">
        <button className="ad-btn ad-btn-primary" onClick={add}>Add Category</button>
      </div>
    </section>
  )
}

/* =====================  MANUAL ENTRY  ===================== */
function Manual({ token, campaigns, onAdded }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', amount: '', campaign: 'general', message: '', anonymous: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setErr(''); setBusy(true)
    try {
      await call('manual', { method: 'POST', token, body: { ...f, amount: Number(f.amount) } })
      setF({ name: '', email: '', phone: '', amount: '', campaign: 'general', message: '', anonymous: false })
      onAdded()
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <section className="ad-card">
      <h2 className="ad-h2">Record an Offline Donation</h2>
      <p className="ad-note">For cash or bank transfers received outside the website. Marked as paid immediately.</p>

      <div className="ad-grid2">
        <div>
          <label className="ad-label">Donor name</label>
          <input className="ad-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </div>
        <div>
          <label className="ad-label">Email</label>
          <input className="ad-input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
      </div>
      <div className="ad-grid2">
        <div>
          <label className="ad-label">Phone</label>
          <input className="ad-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </div>
        <div>
          <label className="ad-label">Amount (RM)</label>
          <input className="ad-input" type="number" min="1" step="0.01" value={f.amount}
                 onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="100.00" />
        </div>
      </div>
      <label className="ad-label">Category</label>
      <select className="ad-input" value={f.campaign} onChange={(e) => setF({ ...f, campaign: e.target.value })}>
        {campaigns.filter((c) => c.active).map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
      </select>
      <label className="ad-label">Note</label>
      <input className="ad-input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })}
             placeholder="e.g. bank transfer 12 Jan" />

      <button type="button" className={`ad-switch small ${f.anonymous ? 'on' : ''}`}
              onClick={() => setF({ ...f, anonymous: !f.anonymous })}>
        <span className="ad-knob" /><span>Record as anonymous</span>
      </button>

      {err && <div className="ad-err">{err}</div>}
      <div className="ad-actions">
        <button className="ad-btn ad-btn-primary" onClick={save} disabled={busy || !f.amount}>
          {busy ? 'Saving…' : 'Record Donation'}
        </button>
      </div>
    </section>
  )
}

/* =====================  ROOT  ===================== */
export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('kp_admin') || '')

  const auth = (t) => { sessionStorage.setItem('kp_admin', t); setToken(t) }
  const logout = () => { sessionStorage.removeItem('kp_admin'); setToken('') }

  return <div className="admin-root">{token ? <Dashboard token={token} onLogout={logout} /> : <Gate onAuth={auth} />}</div>
}
