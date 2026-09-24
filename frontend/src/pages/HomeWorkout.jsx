import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import {
  HW_HERO, HW_LEVELS, HW_WEEKLY, HW_ROADMAP, HW_OVERLOAD,
  HW_RECOVERY, HW_SAFETY, HW_FAQ_NOTE,
} from '../data/homeWorkoutData.js';

export default function HomeWorkout() {
  return (
    <main>
      <PageHero
        eyebrow="FIT TRACK / HOME WORKOUT"
        title={HW_HERO.headline}
        lead={HW_HERO.sub}
        bg={HW_HERO.img.replace('w=1200', 'w=1920')}
      />

      <section className="ft-section surface" aria-label="Training levels">
        <div className="ft-container">
          <SectionHeading
            kicker="Training Levels"
            title="PICK YOUR LEVEL. BUILD FROM THERE."
            lead="Start where you are. Progress when the current level feels manageable."
          />
          <div className="ft-hw-levels">
            {HW_LEVELS.map((lv, i) => (
              <Reveal key={lv.level} delay={i * 90}>
                <Link to={`/home-workout/${lv.slug}`} className="ft-hw-level-link">
                  <article className="ft-hw-level">
                    <div className="ft-hw-level-img">
                      <img src={lv.img} alt={lv.alt} loading="lazy" />
                      <span className="ft-hw-level-badge">{lv.level}</span>
                    </div>
                    <div className="ft-hw-level-body">
                      <b className="ft-hw-level-name">{lv.name}</b>
                      <span className="ft-kicker">Goal</span>
                      <p>{lv.goal}</p>
                      <span className="ft-kicker">Equipment</span>
                      <div className="ft-tag-row">
                        {lv.equipment.map((e) => <span className="ft-tag" key={e}>{e}</span>)}
                      </div>
                      <span className="ft-kicker">Exercises</span>
                      <div className="ft-tag-row">
                        {lv.exercises.map((e) => <span className="ft-tag ft-tag-soft" key={e}>{e}</span>)}
                      </div>
                      <div className="ft-hw-level-meta">
                        <span><b>FREQ</b> {lv.freq}</span>
                        <span><b>DURATION</b> {lv.duration}</span>
                      </div>
                      <span className="ft-link ft-program-cta">VIEW FULL PLAN <span aria-hidden="true">?</span></span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ft-section alt" aria-label="Weekly plans">
        <div className="ft-container">
          <SectionHeading
            kicker="Weekly Plans"
            title="WHAT DOES EACH WEEK LOOK LIKE?"
            lead="Clear day-by-day schedules for every level. Pick one, follow it, repeat."
          />
          <div className="ft-hw-weeks">
            {HW_WEEKLY.map((plan, i) => (
              <Reveal key={plan.level} delay={i * 90}>
                <article className="ft-hw-plan">
                  <span className="ft-kicker">{plan.level}</span>
                  <b>{plan.plan}</b>
                  <div className="ft-hw-plan-grid">
                    {plan.days.map((day) => (
                      <div className="ft-hw-day" key={day.d}>
                        <div className="ft-hw-day-head">
                          <span className="ft-kicker">{day.d}</span>
                          <b>{day.focus}</b>
                        </div>
                        <ul>
                          {day.items.map((it) => <li key={it}>{it}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="ft-section surface" aria-label="Roadmap">
        <div className="ft-container">
          <SectionHeading
            kicker="Roadmap"
            title="BEGINNER TO ADVANCED."
            lead="A clear path from your first workout to structured programming — no guesswork."
          />
          <div className="ft-hw-roadmap">
            {HW_ROADMAP.map((r, i) => (
              <Reveal key={r.stage} delay={i * 100}>
                <article className="ft-hw-roadmap-card">
                  <span className="ft-hw-roadmap-stage">{r.stage}</span>
                  <ul className="ft-hw-roadmap-steps">
                    {r.steps.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                  <p className="ft-hw-roadmap-detail">{r.detail}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Progressive Overload */}
      <section className="ft-section" aria-label="Progressive overload">
        <div className="ft-container">
          <SectionHeading
            kicker="Progressive Overload"
            title="HOW TO GET STRONGER."
            lead="Make the workout slightly harder over time — one variable at a time."
          />
          <div className="ft-hw-overload">
            <Reveal>
              <div className="ft-hw-overload-intro">{HW_OVERLOAD.intro}</div>
            </Reveal>
            <Reveal delay={90}>
              <div className="ft-hw-overload-methods">
                {HW_OVERLOAD.methods.map((m) => (
                  <span key={m} className="ft-tag">{m}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="ft-hw-overload-example">
                <span className="ft-kicker">Example Progression</span>
                <div className="ft-hw-overload-grid">
                  {HW_OVERLOAD.example.map((e) => (
                    <div key={e.w} className="ft-hw-overload-cell">
                      <span className="ft-hw-overload-week">{e.w}</span>
                      <b>{e.v}</b>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Recovery */}
      <section className="ft-section alt" aria-label="Recovery">
        <div className="ft-container">
          <SectionHeading
            kicker="Recovery"
            title="RECOVERY IS PART OF THE WORK."
            lead="You don't get stronger during the workout. You get stronger while you recover from it."
          />
          <div className="ft-hw-rec">
            {HW_RECOVERY.map((r, i) => (
              <Reveal key={r.k} delay={i * 70}>
                <div className="ft-hw-rec-item">
                  <span className="ft-kicker">{r.k}</span>
                  <p>{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="ft-section surface" aria-label="Safety">
        <div className="ft-container">
          <SectionHeading
            kicker="Safety"
            title="TRAIN SMART."
            lead="General fitness guidance only — not medical advice."
          />
          <div className="ft-hw-safety">
            {HW_SAFETY.map((s, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="ft-hw-safety-item">
                  <span className="ft-dot" />
                  <span>{s}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={180}>
            <p className="ft-hw-faq-note">{HW_FAQ_NOTE}</p>
          </Reveal>
        </div>
      </section>

      {/* FAQ / Close */}
      <section className="ft-section" aria-label="FAQ">
        <div className="ft-container">
          <SectionHeading
            kicker="Questions"
            title="COMMON QUESTIONS."
            lead="Quick answers before you start. For anything else, send an enquiry."
          />
          <div className="ft-hw-faq-grid">
            <Reveal>
              <div className="ft-hw-faq-card">
                <span className="ft-kicker">Do I need equipment?</span>
                <p>No — Level 0 uses only bodyweight. Every level tells you exactly what you need before you start.</p>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="ft-hw-faq-card">
                <span className="ft-kicker">How many days per week?</span>
                <p>3 to 5 days depending on level. Rest days are part of the plan, not an optional extra.</p>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="ft-hw-faq-card">
                <span className="ft-kicker">Can beginners follow this?</span>
                <p>Yes. Start at Level 0 and move up only when the current level feels manageable.</p>
              </div>
            </Reveal>
            <Reveal delay={270}>
              <div className="ft-hw-faq-card">
                <span className="ft-kicker">What if I miss a day?</span>
                <p>Continue where you left off. Consistency matters more than perfection.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={360}>
            <div className="ft-hw-faq-cta">
              <Link to="/contact" className="ft-btn ft-btn-primary">START YOUR JOURNEY →</Link>
              <Link to="/membership" className="ft-btn ft-btn-ghost">VIEW MEMBERSHIPS</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}