import { Link, useParams, Navigate } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { getPlanBySlug, getAdjacentLevels } from '../data/homeWorkoutPlansData.js';

const STATUS_LABELS = { WORKOUT: 'WORKOUT', REST: 'REST', OPTIONAL: 'OPTIONAL' };
const STATUS_CLASS = { WORKOUT: 'workout', REST: 'rest', OPTIONAL: 'optional' };

export default function HomeWorkoutPlan() {
  const { level } = useParams();
  const plan = getPlanBySlug(level);

  if (!plan) {
    return <Navigate to="/home-workout" replace />;
  }

  const { prev, next } = getAdjacentLevels(level);

  return (
    <main>
      <PageHero
        eyebrow={`${plan.level} / ${plan.difficulty}`}
        title={plan.name}
        lead={plan.tagline}
      />

      <section className="ft-section surface" aria-label="Plan summary">
        <div className="ft-container">
          <div className="ft-plan-summary">
            <div className="ft-plan-sum-cell"><span className="ft-kicker">LEVEL</span><b>{plan.level}</b></div>
            <div className="ft-plan-sum-cell"><span className="ft-kicker">DURATION</span><b>{plan.duration}</b></div>
            <div className="ft-plan-sum-cell"><span className="ft-kicker">FREQUENCY</span><b>{plan.frequency}</b></div>
            <div className="ft-plan-sum-cell"><span className="ft-kicker">EQUIPMENT</span><b>{plan.equipment}</b></div>
            <div className="ft-plan-sum-cell"><span className="ft-kicker">GOAL</span><b>{plan.goal}</b></div>
          </div>
          <p className="ft-lead" style={{ marginTop: '1.5rem' }}>{plan.overview}</p>
        </div>
      </section>

      <section className="ft-section" aria-label="Weekly schedule">
        <div className="ft-container">
          <SectionHeading kicker="Weekly Schedule" title="KAUNSE DIN KYA KARNA HAI." lead="Your complete day-by-day plan. Follow the schedule exactly — rest days are part of the program." />
          <div className="ft-plan-days">
            {plan.schedule.map((day, i) => (
              <Reveal key={day.day} delay={(i % 7) * 60}>
                <article className={`ft-plan-day ft-plan-day--${STATUS_CLASS[day.status] || 'workout'}`}>
                  <div className="ft-plan-day-head">
                    <span className="ft-plan-day-name">{day.day}</span>
                    <span className={`ft-plan-day-status ft-plan-day-status--${STATUS_CLASS[day.status] || 'workout'}`}>
                      {STATUS_LABELS[day.status] || day.status}
                    </span>
                  </div>
                  <div className="ft-plan-day-body">
                    <b className="ft-plan-day-focus">{day.focus}</b>
                    {day.exercises ? (
                      <div className="ft-plan-exercises">
                        {day.exercises.map((ex) => (
                          <div className="ft-plan-ex" key={ex.name}>
                            <div className="ft-plan-ex-head"><b>{ex.name}</b><span>{ex.sets} × {ex.reps}</span></div>
                            <div className="ft-plan-ex-meta"><span><b>REST:</b> {ex.rest}</span><span><b>EQ:</b> {ex.equipment}</span></div>
                            {ex.focus && <p className="ft-plan-ex-focus">{ex.focus}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="ft-plan-day-recovery">{day.recovery}</p>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ft-section surface" aria-label="Week-by-week progression">
        <div className="ft-container">
          <SectionHeading kicker="Progression" title="WEEK BY WEEK." lead="Each week builds on the last. Do not skip ahead if the current week still feels challenging." />
          <div className="ft-plan-weeks">
            {plan.weeks.map((w, i) => (
              <Reveal key={w.week} delay={i * 80}>
                <div className="ft-plan-week">
                  <div className="ft-plan-week-head"><span className="ft-kicker">{w.week}</span><b>{w.title}</b></div>
                  <p>{w.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ft-section" aria-label="Warm-up">
        <div className="ft-container">
          <SectionHeading kicker="Warm-Up" title="PREP YOUR BODY." lead="Do this before every workout session." />
          <ul className="ft-plan-list">
            {plan.warmup.map((item) => <Reveal key={item} delay={30}><li>{item}</li></Reveal>)}
          </ul>
        </div>
      </section>

      <section className="ft-section surface" aria-label="Cooldown">
        <div className="ft-container">
          <SectionHeading kicker="Cool Down" title="BRING IT DOWN." lead="Do this after every workout session." />
          <ul className="ft-plan-list">
            {plan.cooldown.map((item) => <Reveal key={item} delay={30}><li>{item}</li></Reveal>)}
          </ul>
        </div>
      </section>

      <section className="ft-section" aria-label="How to progress">
        <div className="ft-container">
          <SectionHeading kicker="Progression" title="HOW TO GET STRONGER." />
          <div className="ft-plan-progression"><Reveal><p className="ft-lead">{plan.progression}</p></Reveal></div>
        </div>
      </section>

      <section className="ft-section surface" aria-label="Safety">
        <div className="ft-container">
          <SectionHeading kicker="Safety" title="TRAIN SMART." lead="General fitness guidance only — not medical advice." />
          <div className="ft-plan-safety">
            <Reveal>
              <ul>
                <li>Start at a manageable level. Prioritize correct form over load.</li>
                <li>Stop if an exercise causes sharp or unusual pain.</li>
                <li>Use appropriate space and equipment.</li>
                <li>Beginners should start with manageable loads.</li>
                <li>Consult a qualified professional if you have an injury or medical concern.</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="ft-section" aria-label="Plan navigation">
        <div className="ft-container">
          <div className="ft-plan-nav">
            <Link to="/home-workout" className="ft-btn ft-btn-ghost">← BACK TO HOME WORKOUT</Link>
            <div className="ft-plan-nav-levels">
              {prev && <Link to={`/home-workout/${prev}`} className="ft-btn ft-btn-ghost">← {prev.toUpperCase()}</Link>}
              {next && <Link to={`/home-workout/${next}`} className="ft-btn ft-btn-primary">{next.toUpperCase()} →</Link>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

