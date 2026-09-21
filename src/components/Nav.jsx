import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SOCIALS, SocialIcon } from '../socials'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/about', label: 'About Us' },
  { to: '/milestone', label: 'Milestone' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* black utility strip */}
      <div className="topbar">
        <div className="topbar-in">
          <div className="topbar-l">
            <span className="lbl">Reach Us</span>
            <a href="mailto:unitednation.kolarputih@gmail.com" className="it">
              unitednation.kolarputih@gmail.com
            </a>
            <span className="sep hide-sm">|</span>
            <span className="it hide-sm">Cyberjaya, Selangor</span>
            <span className="sep hide-md">|</span>
            <a href={SOCIALS[0].url} target="_blank" rel="noreferrer"
               className="it hide-md">{SOCIALS[0].handle}</a>
          </div>
          <div className="topbar-r">
            {SOCIALS.map((soc) => (
              <a key={soc.key} href={soc.url} target="_blank" rel="noreferrer" aria-label={soc.label}>
                <SocialIcon name={soc.key} size={16} />
              </a>
            ))}
            <a href="mailto:unitednation.kolarputih@gmail.com" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-8 4.76-8-4.76V6l8 4.76L20 6v2.24Z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <header className={`nav ${stuck ? 'stuck' : ''}`}>
        <div className="nav-in">
          <Link to="/" className="brand" aria-label="Kolar Putih home">
            <img src="/logo-silver.png" alt="Kolar Putih" />
            <span className="brand-txt">
              <span className="brand-name">Kolar Putih</span>
              <span className="brand-sub">Bersatu Demi Masyarakat</span>
            </span>
          </Link>

          <nav className="nav-links">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-cta">
            <Link to="/donate" className="btn btn-chrome nav-donate">
              <span className="ms">volunteer_activism</span> Donate
            </Link>
            <button className="nav-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
              <span className="ms">menu</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer ${open ? 'open' : ''}`}>
        <button className="close" onClick={() => setOpen(false)} aria-label="Close menu">
          <span className="ms">close</span>
        </button>
        {LINKS.map(l => (
          <Link key={l.to} to={l.to} className="drawer-link">
            {l.label}<span className="ms">arrow_forward</span>
          </Link>
        ))}
        <div className="drawer-foot">
          <Link to="/donate" className="btn btn-chrome btn-lg">
            <span className="ms">volunteer_activism</span> Donate
          </Link>
          <div className="drawer-soc">
            {SOCIALS.map((soc) => (
              <a key={soc.key} href={soc.url} target="_blank" rel="noreferrer" aria-label={soc.label}
                 style={{width:46,height:46,borderRadius:4,background:"rgba(255,255,255,.12)",
                         display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                <SocialIcon name={soc.key} size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
