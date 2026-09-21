import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const JOURNEY = [
  {
    year: '2021', tag: 'Introduced', title: 'Kolar Putih is born',
    text: [
      'Our very first event, during a year of lockdowns that made reaching people harder than ever.',
      'We started by packing and giving out food to 200 homeless people around Kuala Lumpur. Every pack was prepared by our own team members — a variety of food, packed by hand for the night distribution.',
      'This was a new experience for all of us. Our first Ramadhan charity event, and the reason we kept going.',
    ],
    img: '/photo_2024-06-26-15.28.29.webp',
  },
  {
    year: '2022', tag: 'Expanded', title: 'Kolar Putih on fire',
    text: [
      'Our second charity event took us further. Clothing and food were packed and distributed to orphanages and homeless people across the Selangor area.',
      'We ordered food in bulk to cut down on preparation time, freeing volunteers to focus on packing and distribution.',
      'Our team split into groups so we could cover several locations in the Klang Valley at once. Our photographer captured the day at an orphanage in Kampung Melayu Subang, Selangor — the children and our team got along famously.',
    ],
    img: '/photo_2024-06-26-14.57.26.webp',
  },
  {
    year: '2023', tag: 'Expanded', title: 'Kolar Putih grows up',
    text: [
      'Our third year, and the year sponsorship and fundraising really took off — clothing, food and cooking ingredients went out in volume.',
      'Members prepared and packed home-cooked food for the homeless community in Kuala Lumpur, then sorted every item into the goods queue for distribution.',
      'Volunteers travelled in from Selangor, Negeri Sembilan, Kuala Lumpur and Putrajaya. All in, 50 members and volunteers turned up for that Ramadhan charity event.',
    ],
    img: '/20232.webp',
  },
  {
    year: '2024', tag: 'New Environment', title: 'New people, new energy',
    text: [
      'Kolar Putih ran another successful charity event in Kuala Lumpur, spreading joy and support to the local community.',
      'A new environment and new faces joining the team — the same mission, carried by more hands than ever.',
    ],
    img: '/photo_2024-06-26-14.57.20.webp',
  },
]

export default function Milestone() {
  return (
    <>
      <section className="phero">
        <div className="wrap">
          <span className="kicker on-dark">Milestone</span>
          <h1>Four years on the street.</h1>
          <p>
            From 200 packed meals in 2021 to a movement of 600+ members — this is how Kolar Putih grew,
            one Ramadhan at a time.
          </p>
        </div>
      </section>

      <section className="sec-dark sec">
        <div className="wrap">
          <div className="tl">
            {JOURNEY.map((j, i) => (
              <Reveal className="tl-item" key={j.year} delay={i * 60}>
                <span className="tl-tag">{j.tag}</span>
                <div className="tl-year">{j.year}</div>
                <h4>{j.title}</h4>
                {j.text.map((p, k) => <p key={k} style={{ marginBottom: k === j.text.length - 1 ? 0 : 16 }}>{p}</p>)}
                <div style={{ marginTop: 26, borderRadius: 'var(--r)', overflow: 'hidden', maxWidth: 620 }}>
                  <img src={j.img} alt={`Kolar Putih ${j.year}`} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split rev">
          <Reveal className="split-media">
            <img src="/20232.webp" alt="Kolar Putih volunteer group photo" />
            <span className="tag">Ramadhan Healing · 2023</span>
          </Reveal>
          <Reveal className="split-body" delay={120}>
            <span className="kicker">Ramadhan Healing</span>
            <h2>500 packs of sahur, one night.</h2>
            <p>
              Alhamdulillah — thanks to the contributions of our donors, the Ramadhan Healing
              programme distributed 500 packs of food for sahur, along with other essentials,
              to those who would otherwise go hungry before dawn.
            </p>
            <p>
              It is the clearest picture of what Kolar Putih does: ordinary Malaysians giving what
              they can, and our volunteers turning it into something someone can eat tonight.
            </p>
            <Link to="/contact#donate" className="btn btn-accent">
              <span className="ms">volunteer_activism</span> Support The Next One
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
