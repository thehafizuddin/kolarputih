import { Link } from 'react-router-dom'
import { Reveal, Counter } from '../components/Reveal'

const TEAM = [
  { name: 'Muhamad Ainnul Haziq', role: 'Pengerusi' },
  { name: 'Ahmad Noor Najmi Haiqal', role: 'Naib Pengerusi' },
  { name: 'Aisar Thaqif', role: 'Setiausaha' },
  { name: 'Nyak Adam', role: 'Naib Setiausaha' },
  { name: 'Nik Izzat', role: 'Bendahari' },
  { name: 'Muhammad Naim', role: 'Naib Bendahari' },
]

const initials = (n) => n.split(' ').slice(0, 2).map(w => w[0]).join('')

const VALUES = [
  { n: '01', icon: 'visibility', title: 'Our Vision',
    p1: 'A community where everyone has access to basic necessities — food, clothing and shelter — including people living without a home.',
    p2: 'We organise large-scale events distributing food packages, fresh produce, cooking ingredients and warm clothing to shelters and individuals in need. By providing these essentials we help restore dignity and hope.' },
  { n: '02', icon: 'target', title: 'Our Mission',
    p1: 'To provide support and resources to homeless individuals and those in need, with a focus on essentials such as food, cooking ingredients and clothing.',
    p2: 'Through annual charity events and partnerships with local organisations, we address the immediate needs of the homeless community while working towards long-term solutions.' },
  { n: '03', icon: 'handshake', title: 'Our Values',
    p1: 'Compassion first, always. We serve without judgement, we show up when it is hard, and we are transparent about where every ringgit goes.',
    p2: 'Every pack is prepared by our own members — we stay close to the people we serve.' },
]

export default function About() {
  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker">About Us</span>
          <h1>Who We Are.</h1>
          <p>
            A team of change-makers who believe that every helping hand can support the
            homeless and build a better future for them.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <Reveal className="split-media">
            <img src="/photo_2024-06-26-14.56.34.webp" alt="Kolar Putih volunteers at a night distribution" />
            <span className="badge">Volunteers · Kuala Lumpur</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker ghost">Our Story</span>
            <h2>Founded In 2020, First Served In 2021.</h2>
            <p>
              Kolar Putih is a dedicated organisation that actively organises and takes part in
              charity events every year to support those in need — particularly the homeless and
              children in orphanages.
            </p>
            <p>
              Our mission is rooted in compassion and a strong belief in the power of community to
              bring about positive change. Through our annual events we provide essential assistance
              and resources that improve lives, offering hope and a chance for a better future.
            </p>
            <p>
              By organising these events we also raise awareness about homelessness and inspire others
              to join us. Together we can build a more compassionate and inclusive society where
              everyone has the opportunity to thrive.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec-paper sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker ghost">Our Approach</span>
            <h2>Vision &amp; Mission.</h2>
          </Reveal>
          <div className="cards">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 110}>
                <div className="card">
                  <span className="num">{v.n}</span>
                  <h3>{v.title}</h3>
                  <p>{v.p1}</p>
                  <p style={{ marginTop: 14 }}>{v.p2}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker ghost">Our Team</span>
            <h2>The People Behind The Work.</h2>
            <p>An elected committee of six, supported by hundreds of volunteers across Malaysia.</p>
          </Reveal>
          <div className="team">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 70}>
                <div className="member">
                  <div className="av">{initials(m.name)}</div>
                  <h4>{m.name}</h4>
                  <span>{m.role}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark sec-tight">
        <div className="wrap">
          <div className="ledger">
            <div className="led"><Counter to={62} suffix="+" /><span>People Helped</span></div>
            <div className="led"><Counter to={300} suffix="K+" prefix="RM" prefixClass="cur" /><span>Funds Raised</span></div>
            <div className="led"><Counter to={20} suffix="K+" /><span>Food Provided</span></div>
            <div className="led"><Counter to={600} suffix="+" /><span>Members</span></div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap cta-in">
          <Reveal>
            <h2>Want To Be Part Of It?</h2>
            <p>We are always looking for volunteers, sponsors and helping hands.</p>
          </Reveal>
          <Reveal className="cta-btns" delay={120}>
            <Link to="/contact" className="btn btn-white btn-lg">
              <span className="ms">mail</span> Contact Us
            </Link>
            <Link to="/milestone" className="btn btn-outline btn-lg">
              <span className="ms">history</span> Our Milestone
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
