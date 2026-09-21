import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const SUBJECTS = ['General enquiry', 'Donation', 'Volunteering', 'Sponsorship / partnership', 'Media & press']

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#donate') {
      const el = document.getElementById('donate')
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140)
    }
  }, [hash])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`
    )
    window.location.href =
      `mailto:unitednation.kolarputih@gmail.com` +
      `?subject=${encodeURIComponent(`[Kolar Putih] ${form.subject}`)}&body=${body}`
    setSent(true)
  }

  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker">Contact</span>
          <h1>Get In Touch.</h1>
          <p>
            Whether you want to donate, sponsor a food pack or volunteer on the next outreach —
            we would love to hear from you.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="info">
            <Reveal>
              <div className="info-item">
                <span className="ms">location_on</span>
                <h4>Based In</h4>
                <p>Cyberjaya, Selangor<br />Malaysia</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="info-item">
                <span className="ms">mail</span>
                <h4>Email</h4>
                <p><a href="mailto:unitednation.kolarputih@gmail.com">unitednation.kolarputih@gmail.com</a></p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="info-item">
                <span className="ms">public</span>
                <h4>Follow Us</h4>
                <p>
                  <a href="https://www.instagram.com/kolarputihofficial" target="_blank" rel="noreferrer">@kolarputihofficial</a><br />
                  <a href="https://www.facebook.com/profile.php?id=61557827740619" target="_blank" rel="noreferrer">Kolar Putih on Facebook</a>
                </p>
              </div>
            </Reveal>
          </div>

          {/* ===== DONATE ===== */}
          <Reveal>
            <div className="donate" id="donate" style={{ scrollMarginTop: 110 }}>
              <div>
                <span className="kicker">Donate</span>
                <h2>Every Ringgit Reaches A Hand.</h2>
                <p>
                  Your contribution goes into food packs, cooking ingredients, clothing and the
                  logistics of getting them to the people who need them — distributed by our own
                  members, not outsourced.
                </p>
                <ul>
                  <li><span className="ms">check_circle</span> Food packs and dry goods for street distribution</li>
                  <li><span className="ms">check_circle</span> Cooking ingredients and fresh produce for shelters</li>
                  <li><span className="ms">check_circle</span> Clothing and basic needs for the homeless</li>
                  <li><span className="ms">check_circle</span> Logistics for night outreach across the Klang Valley</li>
                </ul>
              </div>
              <div>
                <span className="kicker">Ways To Give</span>
                <h2>How You Can Help.</h2>
                <p>
                  Email us to arrange a bank transfer, to sponsor a batch of food packs, or to
                  register as a volunteer for the next outreach.
                </p>
                <p style={{ marginBottom: 26 }}>
                  For sponsorship and corporate partnerships, please include your organisation name
                  and the programme you would like to support.
                </p>
                <a className="btn btn-chrome btn-lg"
                   href="mailto:unitednation.kolarputih@gmail.com?subject=I%20want%20to%20donate%20or%20volunteer">
                  <span className="ms">volunteer_activism</span> Email Us To Donate
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <section className="sec-paper sec">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <Reveal className="split-body">
            <span className="kicker ghost">Message Us</span>
            <h2>Send Us A Message.</h2>
            <p>
              Fill in the form and your email app will open with the message ready to send. If
              nothing happens, email us directly — we read everything.
            </p>
            <p style={{ marginTop: 22 }}>
              <strong style={{ color: 'var(--ink)' }}>Email</strong><br />
              <a href="mailto:unitednation.kolarputih@gmail.com"
                 style={{ color: 'var(--ink)', fontWeight: 600,
                          borderBottom: '2px solid var(--silver-dim)' }}>
                unitednation.kolarputih@gmail.com
              </a>
            </p>
            <p style={{ marginTop: 18 }}>
              <strong style={{ color: 'var(--ink)' }}>Based in</strong><br />
              Cyberjaya, Selangor, Malaysia
            </p>
          </Reveal>

          <Reveal delay={140}>
            <form className="form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="name">Your Name</label>
                <input id="name" required value={form.name} onChange={set('name')} placeholder="Full name" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="you@email.com" />
              </div>
              <div className="field">
                <label htmlFor="subject">I Am Writing About</label>
                <select id="subject" value={form.subject} onChange={set('subject')}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" required value={form.message} onChange={set('message')}
                          placeholder="Tell us how you would like to help..." />
              </div>
              <button type="submit" className="btn btn-black btn-lg">
                <span className="ms">send</span> Send Message
              </button>
              {sent && (
                <div className="ok-msg">
                  Your email app should now be open with the message ready to send. If nothing
                  happened, email us directly at <b>unitednation.kolarputih@gmail.com</b>.
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}
