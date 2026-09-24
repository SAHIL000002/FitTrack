import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { PROGRAMS, SESSION_BLOCKS } from '../data/programsData.js';

const HERO_BG = 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1920&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop';

export default function Programs() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="FIT TRACK / TRAINING"
          title="TRAIN WITH INTENT."
          lead="Structured training designed to help you build strength, improve performance and stay consistent."
          bg={HERO_BG}
        />

        <section className="ft-section surface" id="catalog">
          <div className="ft-container">
            <SectionHeading
              kicker="Program Catalog"
              title="PICK YOUR DISCIPLINE."
              lead="Ten coach-designed tracks. One standard: show up, follow the plan, progress every week."
            />
            <div className="ft-programs-grid">
              {PROGRAMS.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <article className="ft-program-card">
                    <div className="ft-program-media">
                      <img src={p.img} alt={p.alt} loading="lazy" />
                      <span className="ft-program-num">{p.num}</span>
                    </div>
                    <div className="ft-program-body">
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                      <dl className="ft-program-meta">
                        <div><dt>DIFFICULTY</dt><dd>{p.difficulty}</dd></div>
                        <div><dt>DURATION</dt><dd>{p.duration}</dd></div>
                        <div><dt>FOCUS</dt><dd>{p.focus}</dd></div>
                      </dl>
                      <Link to={`/programs/${p.slug}`} className="ft-link ft-program-cta">
                        VIEW PROGRAM <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section" id="session">
          <div className="ft-container">
            <SectionHeading
              kicker="Inside A Session"
              title="EVERY WORKOUT, STRUCTURED."
              lead="No random training. Every FIT TRACK session follows the same proven block system."
            />
            <Reveal>
              <div className="ft-session">
                {SESSION_BLOCKS.map((b) => (
                  <div className="ft-session-block" key={b.k}>
                    <span className="ft-session-k">{b.k}</span>
                    <b className="ft-session-v">{b.v}</b>
                    <span className="ft-session-d">{b.d}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section alt" id="philosophy">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Training Philosophy</div>
              <blockquote>“CONSISTENCY<br />BEATS<br /><span style={{ color: 'var(--lime)' }}>MOTIVATION.</span>”</blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                Progress isn&apos;t built in one perfect workout. It&apos;s built through repeated effort, intelligent programming and discipline.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ft-cta" id="programs-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Start This Week</div>
              <h2>READY TO TRAIN DIFFERENT?</h2>
              <p>Pick a program, get assessed by a coach and start your first structured block this week.</p>
              <div className="ft-cta-btns">
                <Link to="/membership" className="ft-btn ft-btn-primary">JOIN FIT TRACK →</Link>
                <Link to="/membership" className="ft-btn ft-btn-ghost">VIEW MEMBERSHIPS</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
