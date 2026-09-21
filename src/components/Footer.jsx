import { Link } from 'react-router-dom'
import { SOCIALS, CONTACT, SocialIcon } from '../socials'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand">
              <img src="/logo-silver.png" alt="Kolar Putih" />
              <span className="brand-txt">
                <span className="brand-name">Kolar Putih</span>
                <span className="brand-sub">Bersatu Demi Masyarakat</span>
              </span>
            </div>
            <p style={{ maxWidth: '38ch' }}>
              A Malaysian charity founded in 2020, serving since 2021. We feed, clothe and care
              for the homeless and orphaned — one Ramadhan at a time.
            </p>
            <div className="soc-row">
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/campaigns">Campaigns</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/milestone">Milestone</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Reach Us</h4>
            <ul>
              <li>{CONTACT.location}</li>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><Link to="/donate">Donate / Volunteer</Link></li>
            </ul>
            <ul style={{ marginTop: 18 }}>
              {SOCIALS.map((s) => (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noreferrer"
                     style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <SocialIcon name={s.key} size={15} />
                    <span>{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© {year} Persatuan Kebajikan Kolar Putih. All rights reserved.</span>
          <span>Built with care by Apehtech Solutions</span>
        </div>
      </div>
    </footer>
  )
}
