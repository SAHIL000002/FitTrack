import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { getProgramBySlug } from '../data/programsData.js';

export default function ProgramDetail() {
  const { slug } = useParams();
  const program = getProgramBySlug(slug);

  if (!program) {
    return (
      <main>
        <section className="ft-section surface">
          <div className="ft-container" style={{ textAlign: 'center' }}>
            <div className="ft-kicker">404</div>
            <h2>PROGRAM NOT FOUND.</h2>
            <p className="ft-lead" style={{ marginBottom: 28 }}>
              The program you are looking for does not exist or has been renamed.
            </p>
            <Link to="/programs" className="ft-btn ft-btn-primary">BACK TO PROGRAMS</Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const meta = [
    { k: 'DIFFICULTY', v: program.difficulty },
    { k: 'DURATION', v: program.duration },
    { k: 'FREQUENCY', v: program.sessions },
    { k: 'FOCUS', v: program.focus },
  ];

  return (
    <main>
      <PageHero
        eyebrow={`FIT TRACK / PROGRAM ${program.num} / ${program.category}`}
        title={`${program.name}.`}
        lead={program.desc}
        bg={program.img.replace('w=1000', 'w=1920')}
      />

      <section className="ft-section surface" aria-label="Program facts">
        <div className="ft-container">
          <div className="ft-meta-strip">
            {meta.map((m) => (
              <div className="ft-meta-cell" key={m.k}>
                <span className="ft-meta-k">{m.k}</span>
                <b className="ft-meta-v">{m.v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ft-section" aria-label="Program overview">
        <div className="ft-container">
          <SectionHeading
            kicker="Program Overview"
            title="WHO IT'S FOR. WHAT IT BUILDS."
            lead="Know exactly what you are signing up for before your first session."
          />
          <div className="ft-overview-grid">
            <Reveal><div className="ft-overview-card">
              <span className="ft-kicker">What It Is</span>
              <p>{program.overview.what}</p>
            </div></Reveal>
            <Reveal delay={90}><div className="ft-overview-card">
              <span className="ft-kicker">Who It's For</span>
              <p>{program.overview.who}</p>
            </div></Reveal>
            <Reveal delay={180}><div className="ft-overview-card">
              <span className="ft-kicker">Training Goal</span>
              <p>{program.overview.goal}</p>
            </div></Reveal>
          </div>
          <Reveal>
            <div className="ft-train-tags" aria-label="What you'll train">
              <span className="ft-kicker">What You'll Train</span>
              <div className="ft-tag-row">
                {program.trains.map((t) => <span className="ft-tag" key={t}>{t}</span>)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="ft-section alt" aria-label="Weekly structure">
        <div className="ft-container">
          <SectionHeading
            kicker="Weekly Structure"
            title="YOUR TRAINING WEEK."
            lead="A sample training week from this program. Your coach adjusts loads to your level."
          />
          <div className="ft-week-grid">
            {program.week.map((d, i) => (
              <Reveal key={d.day} delay={i * 90}>
                <article className="ft-day-card">
                  <div className="ft-day-head">
                    <span>{d.day}</span>
                    <b>{d.title}</b>
                  </div>
                  <ul className="ft-day-list">
                    {d.exercises.map((ex) => <li key={ex}>{ex}</li>)}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ft-section surface" aria-label="Equipment">
        <div className="ft-container">
          <SectionHeading
            kicker="Equipment Used"
            title="WHAT YOU'LL BE ON."
            lead="Everything below is available on the FIT TRACK floor."
          />
          <div className="ft-tag-row" style={{ justifyContent: 'center' }}>
            {program.equipment.map((e) => <span className="ft-tag ft-tag-lg" key={e}>{e}</span>)}
          </div>
        </div>
      </section>

      <section className="ft-cta">
        <div className="ft-cta-bg" aria-hidden="true"><img src={program.img.replace('w=1000', 'w=1920')} alt="" loading="lazy" /></div>
        <div className="ft-cta-inner">
          <Reveal>
            <div className="ft-kicker" style={{ textAlign: 'center' }}>{program.name} / {program.duration}</div>
            <h2>START YOUR JOURNEY.</h2>
            <p>Join FIT TRACK, get assessed by a coach and begin this program with a plan built around your level.</p>
            <div className="ft-cta-btns">
              <Link to="/register" className="ft-btn ft-btn-primary">START YOUR JOURNEY →</Link>
              <Link to="/membership" className="ft-btn ft-btn-ghost">VIEW MEMBERSHIPS</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}
