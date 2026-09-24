import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { EQUIPMENT, EQUIPMENT_EXTRA, EQUIPMENT_CATEGORIES, TRAINING_STYLES } from '../data/equipmentData.js';

const ALL = [...EQUIPMENT, ...EQUIPMENT_EXTRA];
const HERO_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop';

function EquipCard({ item }) {
  return (
    <article className="ft-program-card ft-equip-card">
      <div className="ft-program-media">
        <img src={item.img} alt={item.alt} loading="lazy" />
        <span className="ft-equip-cat">{item.category}</span>
      </div>
      <div className="ft-program-body">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="ft-equip-type">{item.type}</div>
        <span className="ft-link ft-program-cta">VIEW EQUIPMENT <span aria-hidden="true">→</span></span>
      </div>
    </article>
  );
}

export default function Equipment() {
  const [cat, setCat] = useState('ALL');
  const featured = ALL.filter((e) => e.featured).slice(0, 4);
  const list = cat === 'ALL' ? ALL : ALL.filter((e) => e.category === cat);

  return (
    <>
      <main>
        <PageHero
          eyebrow="FIT TRACK / EQUIPMENT"
          title="BUILT TO PERFORM."
          lead="Serious training starts with serious equipment. Explore the tools built for strength, conditioning, and performance."
          bg={HERO_BG}
        />

        <section className="ft-section surface" id="essentials">
          <div className="ft-container">
            <SectionHeading
              kicker="Featured Equipment"
              title="THE ESSENTIALS."
              lead="Four pieces that define the FIT TRACK floor. Heavy, precise and built to last."
            />
            <div className="ft-featured-grid">
              {featured.map((item, i) => (
                <Reveal key={item.id} delay={(i % 4) * 90}>
                  <EquipCard item={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section" id="floor">
          <div className="ft-container">
            <SectionHeading
              kicker="Full Catalog"
              title="THE FLOOR."
              lead="Every station on the floor, organised by how you train."
            />
            <Reveal>
              <div className="ft-filters" role="tablist" aria-label="Filter equipment by category">
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    className={`ft-filter ${cat === c ? 'is-active' : ''}`}
                    onClick={() => setCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
            <div className="ft-programs-grid" key={cat}>
              {list.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 70}>
                  <EquipCard item={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section surface" id="purpose">
          <div className="ft-container">
            <SectionHeading
              kicker="Equipment Ecosystem"
              title="TRAIN WITH PURPOSE."
              lead="Each zone of the floor maps to a training style."
            />
            <Reveal>
              <div className="ft-rows">
                {TRAINING_STYLES.map((s) => (
                  <div className="ft-row" key={s.k}>
                    <div><h4>{s.k}</h4><h3>{s.d}</h3><p>{s.items}</p></div>
                    <div className="meta">FIT TRACK<br />FLOOR →</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section alt" id="eq-philosophy">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Equipment Philosophy</div>
              <blockquote>“NO DISTRACTIONS.<br /><span style={{ color: 'var(--lime)' }}>JUST BETTER TOOLS.</span>”</blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                Every piece of equipment has a purpose. We build the floor around movements
                that help you train consistently, progressively, and with intent.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ft-cta" id="equipment-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Ready To Train?</div>
              <h2>YOUR NEXT SESSION STARTS HERE.</h2>
              <p>Tour the floor, test the essentials and pick the program that fits your goal.</p>
              <div className="ft-cta-btns">
                <Link to="/membership" className="ft-btn ft-btn-primary">JOIN FIT TRACK →</Link>
                <Link to="/programs" className="ft-btn ft-btn-ghost">VIEW PROGRAMS</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
