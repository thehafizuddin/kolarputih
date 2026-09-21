import { Link } from 'react-router-dom'
import { Reveal, Counter } from '../components/Reveal'
import { CampaignCollage } from '../components/CampaignCollage'

const PILLARS = [
  { icon: 'restaurant', title: 'Supporting The Homeless',
    text: 'Hot meals, dry food, cooking ingredients and warm clothing handed directly to people living on the street.' },
  { icon: 'volunteer_activism', title: 'Helping Orphaned Children',
    text: 'Making sure orphanages have what they need to raise children in a safe, nurturing environment.' },
  { icon: 'diversity_3', title: 'Fostering Community Engagement',
    text: 'Rallying volunteers from Selangor, Kuala Lumpur, Putrajaya and Negeri Sembilan to show up and serve.' },
  { icon: 'menu_book', title: 'Promoting Education',
    text: 'Opening doors to learning resources so underprivileged children can reach their full potential.' },
]

const CARDS = [
  { n: '01', icon: 'content_cut', title: 'Care Beyond Food',
    text: 'Free haircuts, personal care and a listening ear for people who are too often looked past.' },
  { n: '02', icon: 'package_2', title: 'Packed With Our Own Hands',
    text: 'Every food pack is prepared and sorted by our members and volunteers — nothing is outsourced.' },
  { n: '03', icon: 'local_shipping', title: 'Straight To The Street',
    text: 'We go to where the need is: night distribution in Kuala Lumpur and shelter visits across Selangor.' },
]

const MARQUEE = [
  'FOOD DISTRIBUTION', 'ORPHANAGE SUPPORT', 'RAMADHAN OUTREACH',
  'VOLUNTEER LED', 'SINCE 2020', 'KUALA LUMPUR & SELANGOR',
]

export default function Home() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/hero-makan.webp" alt="A Kolar Putih volunteer cutting a homeless man's hair at night" />
        </div>
        <div className="wrap hero-in">
          <span className="kicker">Malaysia · Since 2020</span>
          <h1>
            Compassion
            <span className="hl">In Action.</span>
          </h1>
          <p className="hero-lede">
            Persatuan Kebajikan Kolar Putih is a Malaysian charity built on one belief — that every
            helping hand can restore dignity to someone living without a home.
          </p>
          <div className="hero-actions">
            <Link to="/donate" className="btn btn-chrome btn-lg">
              <span className="ms">volunteer_activism</span> Donate Now
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              Who We Are <span className="ms">arrow_forward</span>
            </Link>
          </div>
          <div className="hero-strip">
            <div className="hero-stat">
              <Counter to={62} suffix="+" />
              <span>People Helped</span>
            </div>
            <div className="hero-stat">
              <Counter to={300} suffix="K+" prefix="RM" prefixClass="cur" />
              <span>Funds Raised</span>
            </div>
            <div className="hero-stat">
              <Counter to={20} suffix="K+" />
              <span>Food Provided</span>
            </div>
            <div className="hero-stat">
              <Counter to={600} suffix="+" />
              <span>Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>

      {/* ===== INTRO ===== */}
      <section className="sec">
        <div className="wrap split">
          <Reveal className="split-media">
            <img src="/photo_2024-06-26-15.28.29.webp" alt="Kolar Putih volunteers distributing food packs in Kuala Lumpur" />
            <span className="badge">Ramadhan Outreach · KL</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker ghost">Our Impact</span>
            <h2>A Small Team, Showing Up Every Year.</h2>
            <p>
              Every year we plan and run our own charity events — no middlemen, no outsourcing.
              Our members pack the food, load the vehicles and stand on the street to hand it over
              themselves.
            </p>
            <p>
              What started in 2021 with 200 homeless people around Kuala Lumpur has grown into a
              movement of 600+ members and volunteers across four states.
            </p>
            <Link to="/milestone" className="btn btn-outline" style={{ marginTop: 10 }}>
              See Our Milestone <span className="ms">arrow_forward</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== PHOTO GRID ===== */}
      <section className="pgrid">
        <figure className="pg-item">
          <img src="/photo_2024-06-26-14.56.34.webp" alt="Kolar Putih volunteers with food packs at night" />
          <figcaption>Night Distribution</figcaption>
        </figure>
        <figure className="pg-item">
          <img src="/photo_2024-06-26-14.57.20.webp" alt="Volunteers giving out goods to the homeless" />
          <figcaption>Kuala Lumpur</figcaption>
        </figure>
        <figure className="pg-item">
          <img src="/20232.webp" alt="Kolar Putih Ramadhan Healing 2023 group photo" />
          <figcaption>Ramadhan Healing 2023</figcaption>
        </figure>
        <figure className="pg-item">
          <img src="/photo_2024-06-26-14.57.26.webp" alt="Kolar Putih team distributing clothing and food" />
          <figcaption>Packing Night</figcaption>
        </figure>
      </section>

      {/* ===== OPEN APPEALS (collage) ===== */}
      <CampaignCollage limit={4} />

      {/* ===== NUMBERS ===== */}
      <section className="sec-dark sec-tight">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker">By The Numbers</span>
            <h2>Numbers That Push Us To Do Better.</h2>
            <p>We track what we give, because the people we serve deserve more than good intentions.</p>
          </Reveal>
          <div className="ledger">
            <div className="led">
              <Counter to={62} suffix="+" /><span>People Helped</span>
              <i>Individuals reached through our street and shelter programmes.</i>
            </div>
            <div className="led">
              <Counter to={300} suffix="K+" prefix="RM" prefixClass="cur" /><span>Funds Raised</span>
              <i>Ringgit raised from donors and sponsors since our first event.</i>
            </div>
            <div className="led">
              <Counter to={20} suffix="K+" /><span>Food Provided</span>
              <i>Packed meals and dry goods handed out to those in need.</i>
            </div>
            <div className="led">
              <Counter to={600} suffix="+" /><span>Members</span>
              <i>Members and volunteers across Selangor, KL, Putrajaya and N. Sembilan.</i>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="sec">
        <div className="wrap split rev">
          <Reveal className="split-media">
            <img src="/photo_2024-06-26-14.57.26.webp" alt="Kolar Putih volunteers sorting goods for distribution" />
            <span className="badge">Packing Night · Selangor</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker ghost">Our Mission</span>
            <h2>Four Things We Refuse To Ignore.</h2>
            <div className="rows" style={{ marginTop: 26 }}>
              {PILLARS.map(p => (
                <div className="row" key={p.title}>
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

      {/* ===== HOW WE SERVE ===== */}
      <section className="sec-paper sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="kicker ghost">How We Serve</span>
            <h2>Dignity, Not Just Donations.</h2>
            <p>
              For someone who has been ignored all day, a hot meal and a haircut is not charity — it is
              being seen as a person again.
            </p>
          </Reveal>
          <div className="cards">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <div className="card">
                  <span className="num">{c.n}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="cta">
        <div className="wrap cta-in">
          <Reveal>
            <h2>Your Helping Hand Changes A Life Tonight.</h2>
            <p>
              Donate, sponsor a food pack, or volunteer with us on the next outreach.
              Every ringgit goes straight into the hands of someone who needs it.
            </p>
          </Reveal>
          <Reveal className="cta-btns" delay={120}>
            <Link to="/donate" className="btn btn-white btn-lg">
              <span className="ms">volunteer_activism</span> Donate
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              <span className="ms">mail</span> Get In Touch
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
