import { Link } from 'react-router-dom'
import { Reveal, Counter } from '../components/Reveal'

const PILLARS = [
  { icon: 'restaurant', title: 'Supporting the Homeless',
    text: 'Hot meals, dry food, cooking ingredients and warm clothing handed directly to those living on the street.' },
  { icon: 'volunteer_activism', title: 'Helping Orphaned Children',
    text: 'Making sure orphanages have what they need to raise children in a safe, nurturing environment.' },
  { icon: 'diversity_3', title: 'Fostering Community Engagement',
    text: 'Rallying volunteers from Selangor, KL, Putrajaya and Negeri Sembilan to show up and serve.' },
  { icon: 'menu_book', title: 'Promoting Education',
    text: 'Opening doors to learning resources so underprivileged children can reach their full potential.' },
]

const CARE = [
  { icon: 'content_cut', title: 'Care Beyond Food',
    text: 'Free haircuts, personal care and a listening ear for people who are too often looked past.' },
  { icon: 'package_2', title: 'Packed With Our Own Hands',
    text: 'Every food pack is prepared and sorted by our members and volunteers — nothing is outsourced.' },
  { icon: 'local_shipping', title: 'Straight to the Street',
    text: 'We go to where the need is: night distribution in Kuala Lumpur and shelter visits across Selangor.' },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/hero-makan.webp" alt="A Kolar Putih volunteer cutting a homeless man's hair at night" />
        </div>
        <div className="wrap hero-in">
          <span className="kicker on-dark">Since 2020 · Malaysia</span>
          <h1>Compassion, <em>in action.</em></h1>
          <p className="hero-lede">
            Persatuan Kebajikan Kolar Putih is a Malaysian charity built on one belief —
            that every helping hand can restore dignity to someone living without a home.
          </p>
          <div className="hero-actions">
            <Link to="/contact#donate" className="btn btn-light">
              <span className="ms">volunteer_activism</span> Donate Now
            </Link>
            <Link to="/about" className="btn btn-ghost">
              Who We Are <span className="ms">arrow_forward</span>
            </Link>
          </div>
          <div className="hero-strip">
            <div className="hero-stat">
              <b><Counter to={62} suffix="+" /></b>
              <span>People Helped</span>
            </div>
            <div className="hero-stat">
              <b><Counter to={300} prefix="RM " suffix="K+" /></b>
              <span>Funds Raised</span>
            </div>
            <div className="hero-stat">
              <b><Counter to={20} suffix="K+" /></b>
              <span>Food Provided</span>
            </div>
            <div className="hero-stat">
              <b><Counter to={600} suffix="+" /></b>
              <span>Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO / EDITORIAL SPLIT */}
      <section className="sec">
        <div className="wrap split">
          <Reveal className="split-media">
            <img src="/photo_2024-06-26-15.28.29.webp" alt="Kolar Putih volunteers distributing food packs in Kuala Lumpur" />
            <span className="tag">Ramadhan Outreach · KL</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker">Our Impact</span>
            <h2>A small team, showing up every year.</h2>
            <p>
              Every year we plan and run our own charity events — no middlemen, no outsourcing.
              Our members pack the food, load the vehicles and stand on the street to hand it over
              themselves.
            </p>
            <p>
              What started in 2021 with 200 homeless people around Kuala Lumpur has grown into a
              movement of 600+ members and volunteers across four states.
            </p>
            <Link to="/milestone" className="btn btn-outline">
              See Our Journey <span className="ms">arrow_forward</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PHOTO BAND */}
      <section className="band">
        <div className="band-img"><img src="/photo_2024-06-26-14.56.34.webp" alt="Kolar Putih volunteers with food packs at night" /></div>
        <div className="band-img"><img src="/photo_2024-06-26-14.57.20.webp" alt="Volunteers giving out goods to the homeless" /></div>
        <div className="band-img"><img src="/20232.webp" alt="Kolar Putih Ramadhan Healing 2023 group photo" /></div>
        <div className="band-img"><img src="/photo_2024-06-26-14.57.26.webp" alt="Kolar Putih team distributing clothing and food" /></div>
      </section>

      {/* NUMBERS */}
      <section className="sec-dark sec-tight">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker on-dark">By The Numbers</span>
            <h2>Numbers that push us to do better.</h2>
            <p>We track what we give, because the people we serve deserve more than good intentions.</p>
          </Reveal>
        </div>
        <div className="wrap">
          <div className="nums">
            <div className="num">
              <Counter to={62} suffix="+" /><span>People Helped</span>
              <i>Individuals reached through our street and shelter programmes.</i>
            </div>
            <div className="num">
              <Counter to={300} prefix="RM " suffix="K+" /><span>Funds Raised</span>
              <i>Ringgit raised from donors and sponsors since 2020.</i>
            </div>
            <div className="num">
              <Counter to={20} suffix="K+" /><span>Food Provided</span>
              <i>Packed meals and dry goods handed out to those in need.</i>
            </div>
            <div className="num">
              <Counter to={600} suffix="+" /><span>Members</span>
              <i>Members and volunteers across Selangor, KL, Putrajaya and Negeri Sembilan.</i>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION PILLARS */}
      <section className="sec">
        <div className="wrap split rev">
          <Reveal className="split-media">
            <img src="/photo_2024-06-26-14.57.26.webp" alt="Kolar Putih volunteers sorting goods for distribution" />
            <span className="tag">Packing Night · Selangor</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker">Our Mission</span>
            <h2>Four things we refuse to ignore.</h2>
            <div className="pillars">
              {PILLARS.map(p => (
                <div className="pillar" key={p.title}>
                  <span className="ms">{p.icon}</span>
                  <div>
                    <h4>{p.title}</h4>
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CARE CARDS */}
      <section className="sec-paper sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker">How We Serve</span>
            <h2>Dignity, not just donations.</h2>
            <p>
              For someone who has been ignored all day, a hot meal and a haircut is not charity — it is
              being seen as a person again.
            </p>
          </Reveal>
          <div className="care">
            {CARE.map((c, i) => (
              <Reveal key={c.title} delay={i * 110}>
                <div className="card">
                  <div className="ic"><span className="ms">{c.icon}</span></div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal>
            <span className="kicker on-dark" style={{ justifyContent: 'center' }}>Join Us</span>
            <h2>Your helping hand changes a life tonight.</h2>
            <p>
              Donate, sponsor a food pack, or volunteer with us on the next outreach.
              Every ringgit goes straight into the hands of someone who needs it.
            </p>
            <div className="cta-btns">
              <Link to="/contact#donate" className="btn btn-light">
                <span className="ms">volunteer_activism</span> Donate
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                <span className="ms">mail</span> Get In Touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
