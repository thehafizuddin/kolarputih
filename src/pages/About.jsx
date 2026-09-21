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

export default function About() {
  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker on-dark">About Us</span>
          <h1>Who we are.</h1>
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
            <span className="tag">Volunteers · Kuala Lumpur</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker">Our Story</span>
            <h2>Founded in 2020, first served in 2021.</h2>
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
            <span className="kicker">Our Approach</span>
            <h2>Vision &amp; mission.</h2>
          </Reveal>
          <div className="care">
            <Reveal>
              <div className="card">
                <div className="ic"><span className="ms">visibility</span></div>
                <h3>Our Vision</h3>
                <p>
                  A community where everyone has access to basic necessities — food, clothing and
                  shelter — including people living without a home.
                </p>
                <p style={{ marginTop: 14 }}>
                  We organise large-scale events distributing food packages, fresh produce, cooking
                  ingredients and warm clothing to shelters and individuals in need. By providing
                  these essentials we help restore dignity and hope.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="card">
                <div className="ic"><span className="ms">target</span></div>
                <h3>Our Mission</h3>
                <p>
                  To provide support and resources to homeless individuals and those in need, with a
                  focus on essentials such as food, cooking ingredients and clothing.
                </p>
                <p style={{ marginTop: 14 }}>
                  Through annual charity events and partnerships with local organisations, we address
                  the immediate needs of the homeless community while working towards long-term
                  solutions.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="card">
                <div className="ic"><span className="ms">handshake</span></div>
                <h3>Our Values</h3>
                <p>
                  Compassion first, always. We serve without judgement, we show up when it is hard,
                  and we are transparent about where every ringgit goes.
                </p>
                <p style={{ marginTop: 14 }}>
                  Every pack is prepared by our own members — we stay close to the people we serve.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker">Our Team</span>
            <h2>The people behind the work.</h2>
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
          <div className="nums">
            <div className="num"><Counter to={62} suffix="+" /><span>People Helped</span></div>
            <div className="num"><Counter to={300} prefix="RM " suffix="K+" /><span>Funds Raised</span></div>
            <div className="num"><Counter to={20} suffix="K+" /><span>Food Provided</span></div>
            <div className="num"><Counter to={600} suffix="+" /><span>Members</span></div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <Reveal>
            <h2>Want to be part of it?</h2>
            <p>We are always looking for volunteers, sponsors and helping hands.</p>
            <div className="cta-btns">
              <Link to="/contact" className="btn btn-light">
                <span className="ms">mail</span> Contact Us
              </Link>
              <Link to="/milestone" className="btn btn-ghost">
                <span className="ms">history</span> Our Milestone
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
