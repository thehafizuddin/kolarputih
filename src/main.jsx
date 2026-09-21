import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import './admin.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Milestone from './pages/Milestone'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import PublicDonate, { ThankYou } from './pages/Donate'
import Campaign from './pages/Campaign'

function ScrollTop() {
  const { pathname } = useLocation()
  React.useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/** The admin dashboard gets its own shell — no site nav or footer. */
function Shell() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollTop />
      {!pathname.startsWith('/admin') && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/milestone" element={<Milestone />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<PublicDonate />} />
        <Route path="/c/:slug" element={<Campaign />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!pathname.startsWith('/admin') && <Footer />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>
)
