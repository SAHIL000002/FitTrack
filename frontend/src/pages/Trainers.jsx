import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { TRAINERS, TRAINERS_EXTRA, TRAINER_FILTERS, COACHING_STEPS } from '../data/trainersData.js';

const ALL = [...TRAINERS, ...TRAINERS_EXTRA];
const HERO_BG = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1920&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop';

function TrainerCard({ t }) {
  return (
    <article className="ft-program-card ft-coach-card">
      <div className="ft-program-media ft-coach-media">
        <img src={t.img} alt={t.alt} loading="lazy" />
        <span className="ft-equip-cat">{t.specialty}</span>
      </div>
      <div className="ft-program-body">
        <div className="ft-coach-role">{t.role} · {t.experience}</div>
        <h3>{t.name}</h3>
        <p>{t.bio}</p>
        <div className="ft-coach-tags">
          {t.trainingStyles.map((s) => (<span key={s}>{s}</span>))}
        </div>
        <span className="ft-link ft-program-cta">VIEW COACH <span aria-hidden="true">→</span></span>
      </div>
    </article>
  );
}

export default function Trainers() {
  const [filter, setFilter] = useState('ALL');
  const featured = ALL.find((t) => t.featured) || ALL[0];
  const list = filter === 'ALL' ? ALL : ALL.filter((t) => t.specialty === filter);
  return (
    <>
      <main>
        <PageHero eyebrow="FIT TRACK / COACHING" title="TRAIN WITH EXPERTS."
          lead="The right coach does more than count reps. Our trainers help you move with purpose, train consistently, and build better habits."
          bg={HERO_BG} />
        <section className="ft-section surface" id="standard">
          <div className="ft-container">
            <SectionHeading kicker="Featured Coach" title="THE COACHING STANDARD."
              lead="One coach, one method: assess honestly, program simply, progress patiently." />
            <Reveal>
              <div className="ft-feature-split">
                <div className="ft-feature-media"><img src={featured.img} alt={featured.alt} loading="lazy" /></div>
                <div className="ft-feature-body">
                  <div className="ft-kicker">{featured.role}</div>
                  <h3 className="ft-feature-name">{featured.name}</h3>
                  <div className="ft-feature-meta">{featured.specialty} · {featured.experience} EXPERIENCE</div>
                  <p>{featured.bio}</p>
                  <div className="ft-coach-tags">{featured.trainingStyles.map((s) => (<span key={s}>{s}</span>))}</div>
                  <div className="ft-feature-certs">{featured.certifications.map((c) => (<span key={c}>{c}</span>))}</div>
                  <a href="#team" className="ft-btn ft-btn-primary">VIEW COACHING →</a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <section className="ft-section" id="team">
          <div className="ft-container">
            <SectionHeading kicker="Coaching Team" title="MEET THE TEAM."
              lead="Six coaches. One floor. Pick the style that fits your goal." />
            <Reveal>
              <div className="ft-filters" role="tablist" aria-label="Filter trainers by specialization">
                {TRAINER_FILTERS.map((f) => (
                  <button key={f} role="tab" aria-selected={filter === f}
                    className={`ft-filter ${filter === f ? 'is-active' : ''}`}
                    onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </Reveal>
            <div className="ft-trainers-grid" key={filter}>
              {list.map((t, i) => (<Reveal key={t.id} delay={(i % 3) * 70}><TrainerCard t={t} /></Reveal>))}
            </div>
          </div>
        </section>
        <section className="ft-section surface" id="approach">
          <div className="ft-container">
            <SectionHeading kicker="Coaching Process" title="HOW WE COACH."
              lead="Same process for every member, from first session to year three." />
            <Reveal>
              <div className="ft-steps">
                {COACHING_STEPS.map((s) => (
                  <div className="ft-step" key={s.n}>
                    <span className="ft-step-num">{s.n}</span><h3>{s.k}</h3><p>{s.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
        <section className="ft-section alt" id="coaching-philosophy">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Coaching Philosophy</div>
              <blockquote>MORE THAN A WORKOUT.<br /><span style={{ color: 'var(--lime)' }}>COACHING BUILDS CONSISTENCY.</span></blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                A good training plan gives you direction. A good coach helps you stay accountable,
                understand your movement, and keep progressing when motivation fades.
              </p>
            </Reveal>
          </div>
        </section>
        <section className="ft-cta" id="trainers-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Ready To Train Smarter?</div>
              <h2>FIND YOUR COACHING EDGE.</h2>
              <p>Meet the team on a trial session, then lock in the program and coach that fit you.</p>
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
