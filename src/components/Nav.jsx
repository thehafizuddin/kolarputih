import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/milestone', label: 'Milestone' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const transparent = isHome && !solid && !open

  return (
    <>
      <header className={`nav ${transparent ? 'nav-transparent' : 'nav-solid'}`}>
        <div className="nav-in">
          <Link to="/" className="brand" aria-label="Kolar Putih home">
            <img src="/logo.png" alt="Kolar Putih" />
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
            <Link to="/contact#donate" className="btn btn-accent nav-donate">
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
          <Link to="/contact#donate" className="btn btn-accent" style={{ justifyContent: 'center' }}>
            <span className="ms">volunteer_activism</span> Donate
          </Link>
          <div className="soc">
            <a href="https://www.instagram.com/kolarputihofficial" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61557827740619" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </div>
    </>
  )
}
