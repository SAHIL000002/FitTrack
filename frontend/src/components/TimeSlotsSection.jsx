import { Reveal } from '../hooks/useReveal.jsx';

const SLOTS = [
  {
    label: 'MORNING',
    hours: '06:00 AM — 10:00 AM',
    tags: ['Strength', 'Cardio', 'Personal Training'],
    blurb: 'Start the day strong. Lighter floors, focused coaching and first access to equipment.',
  },
  {
    label: 'EVENING',
    hours: '05:00 PM — 10:00 PM',
    tags: ['Strength', 'Hypertrophy', 'Functional Training'],
    blurb: 'Train after work. Full floor access, group sessions and coached program blocks.',
  },
];

export default function TimeSlotsSection() {
  return (
    <section className="ft-section ft-timeslots" id="timeslots" aria-label="Training time slots">
      <div className="ft-container">
        <Reveal>
          <div className="ft-section-head">
            <span className="ft-kicker">TRAIN WHEN IT FITS YOUR DAY</span>
            <h2>MORNING · EVENING.</h2>
            <p>Two training windows, same floor, same standards. Pick the slot that fits your schedule.</p>
          </div>
        </Reveal>
        <div className="ft-ts-grid">
          {SLOTS.map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <article className="ft-ts-col">
                <div className="ft-ts-head">
                  <span className="ft-kicker">{s.label} SLOT</span>
                  <b>{s.hours}</b>
                </div>
                <div className="ft-ts-tags">
                  {s.tags.map((t) => <span className="ft-tag" key={t}>{t}</span>)}
                </div>
                <p className="ft-ts-blurb">{s.blurb}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}