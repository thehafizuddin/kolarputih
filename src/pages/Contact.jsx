import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: 'General enquiry', message: '' })
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#donate') {
      const el = document.getElementById('donate')
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120)
    }
  }, [hash])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`
    )
    window.location.href = `mailto:unitednation.kolarputih@gmail.com?subject=${encodeURIComponent(
      `[Kolar Putih] ${form.subject}`
    )}&body=${body}`
    setSent(true)
  }

  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker on-dark">Contact</span>
          <h1>Get in touch.</h1>
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
            <Reveal delay={110}>
              <div className="info-item">
                <span className="ms">mail</span>
                <h4>Email</h4>
                <p><a href="mailto:unitednation.kolarputih@gmail.com">unitednation.kolarputih@gmail.com</a></p>
              </div>
            </Reveal>
            <Reveal delay={220}>
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

          <div className="split" id="donate" style={{ scrollMarginTop: 100 }}>
            <Reveal className="split-body">
              <span className="kicker">Donate / Volunteer</span>
              <h2 style={{ fontSize: 'clamp(26px,3.4vw,40px)', marginBottom: 20 }}>
                Every ringgit reaches a hand.
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Your contribution goes into food packs, cooking ingredients, clothing and the
                logistics of getting them to the people who need them — distributed by our own
                members, not outsourced.
              </p>
              <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
                Email us to arrange a bank transfer, to sponsor a batch of food packs, or to
                register as a volunteer for the next outreach.
              </p>
              <a className="btn btn-accent"
                 href="mailto:unitednation.kolarputih@gmail.com?subject=I%20want%20to%20donate%20or%20volunteer">
                <span className="ms">volunteer_activism</span> Email Us To Donate
              </a>
            </Reveal>

            <Reveal delay={140}>
              <span className="kicker">Message Us</span>
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
                  <label htmlFor="subject">I am writing about</label>
                  <select id="subject" value={form.subject} onChange={set('subject')} className=""
                    style={{ fontFamily: 'inherit', fontSize: 16, padding: '15px 17px', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: '#fff' }}>
                    <option>General enquiry</option>
                    <option>Donation</option>
                    <option>Volunteering</option>
                    <option>Sponsorship / partnership</option>
                    <option>Media &amp; press</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" required value={form.message} onChange={set('message')} placeholder="Tell us how you would like to help..." />
                </div>
                <button type="submit" className="btn btn-dark" style={{ justifyContent: 'center' }}>
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
        </div>
      </section>
    </>
  )
}
