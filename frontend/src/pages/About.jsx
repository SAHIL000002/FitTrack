import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { ABOUT_PRINCIPLES, ABOUT_STANDARDS, ABOUT_NAVIGATION } from '../data/aboutData.js';

const HERO_BG = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format&fit=crop';
const STORY_IMG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop';

function NavCard({ item, index }) {
  return (
    <Link to={item.to} className="ft-program-card" aria-label={`Go to ${item.k}`}>
      <div className="ft-program-body">
        <div className="ft-program-num" style={{ position: 'static', fontSize: 40 }}>{String(index + 1).padStart(2, '0')}</div>
        <h3>{item.k}</h3>
        <p>{item.d}</p>
        <span className="ft-link ft-program-cta">OPEN <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}

export default function About() {
  return (
    <>
      <main>
        <PageHero eyebrow="FIT TRACK / OUR STORY" title="BUILT FOR THE WORK."
          lead="FIT TRACK is a training environment built around discipline, quality equipment, expert coaching, and the belief that consistency creates change."
          bg={HERO_BG} />

        <section className="ft-section alt" id="why">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Why Fit Track?</div>
              <blockquote>TRAINING SHOULD BE SIMPLE.<br /><span style={{ color: 'var(--lime)' }}>THE WORK SHOULD BE SERIOUS.</span></blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                No unnecessary distractions. No shortcuts. Just a focused environment where people
                can train with better equipment, better structure, and better intent.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ft-section surface" id="story">
          <div className="ft-container">
            <SectionHeading kicker="Brand Story" title="OUR STORY."
              lead="A simple idea: make training easier to commit to — not harder to understand." />
            <Reveal>
              <div className="ft-feature-split">
                <div className="ft-feature-media">
                  <img src={STORY_IMG} alt="Inside the FIT TRACK training floor with racks and lighting" loading="lazy" />
                </div>
                <div className="ft-feature-body">
                  <div className="ft-kicker">The Idea</div>
                  <h3 className="ft-feature-name">SHOW UP. LEARN. REPEAT.</h3>
                  <p>
                    FIT TRACK was created around a simple idea: people do not need more noise around
                    fitness. They need a place where they can show up, understand what they are
                    doing, use the right equipment, access quality coaching, and build consistency
                    over time.
                  </p>
                  <p>
                    The gym should make training easier to commit to — not harder to understand.
                    Clear programs, a serious floor, coaches who explain the why, and an environment
                    that respects effort.
                  </p>
                  <Link to="/programs" className="ft-btn ft-btn-primary">SEE HOW WE TRAIN →</Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section" id="principles">
          <div className="ft-container">
            <SectionHeading kicker="Our Principles" title="WHAT WE BELIEVE."
              lead="Four ideas that shape every program, session, and coaching cue." />
            <Reveal>
              <div className="ft-steps">
                {ABOUT_PRINCIPLES.map((p) => (
                  <div className="ft-step" key={p.n}>
                    <span className="ft-step-num">{p.n}</span><h3>{p.k}</h3><p>{p.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section surface" id="standard">
          <div className="ft-container">
            <SectionHeading kicker="The Standard" title="THE STANDARD."
              lead="What every FIT TRACK session is held to — training, tools, coaching, and culture." />
            <div className="ft-benefits">
              {ABOUT_STANDARDS.map((s, i) => (
                <Reveal key={s.k} delay={(i % 4) * 90}>
                  <div className="ft-benefit">
                    <span className="ft-benefit-num">{s.n}</span>
                    <h3>{s.k}</h3>
                    <p>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section" id="explore">
          <div className="ft-container">
            <SectionHeading kicker="Keep Exploring" title="THE FIT TRACK JOURNEY."
              lead="Programs, equipment, coaching, and membership — one connected system." />
            <div className="ft-about-nav">
              {ABOUT_NAVIGATION.map((item, i) => (
                <Reveal key={item.to} delay={(i % 4) * 90}>
                  <NavCard item={item} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section alt" id="about-philosophy">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Philosophy</div>
              <blockquote>DISCIPLINE IS<br /><span style={{ color: 'var(--lime)' }}>THE DIFFERENCE.</span></blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                You do not need to become someone else overnight. You need a place that helps you
                keep showing up and doing the work.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ft-cta" id="about-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Ready To Start?</div>
              <h2>THE WORK STARTS WITH YOU.</h2>
              <p>Pick a plan, meet the coaches, and start your first training block this week.</p>
              <div className="ft-cta-btns">
                <Link to="/membership" className="ft-btn ft-btn-primary">VIEW MEMBERSHIPS →</Link>
                <Link to="/trainers" className="ft-btn ft-btn-ghost">MEET THE TRAINERS</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

