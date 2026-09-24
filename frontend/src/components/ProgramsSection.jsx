const ITEMS = [
  { n: '01', t: 'STRENGTH', d: 'Calibrated discs, monolithic power racks, multi-grip pull-up structures and deadlift platforms built for maximum load.' },
  { n: '02', t: 'CONDITIONING', d: 'SkiErgs, AirBikes, curved treadmills and sled tracks designed for anaerobic capacity building.' },
  { n: '03', t: 'FUNCTIONAL', d: 'Urethane dumbbells to 150lbs, dual-stack cable columns, kettlebells, slam balls and gymnastics rings.' },
];

export default function ProgramsSection() {
  return (
    <section className="ft-section surface" id="programs">
      <div className="ft-container">
        <div className="ft-head-row">
          <div>
            <div className="ft-kicker">Training Programs</div>
            <h2 className="ft-title">THE TOOLS MATTER.</h2>
          </div>
          <p className="ft-lead">Professional-grade programming engineered for serious training. No compromises, heavy output only.</p>
        </div>
        <div className="ft-cards3">
          {ITEMS.map((c) => (
            <div className="ft-card" key={c.n}>
              <div className="num">{c.n}</div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              <span className="ft-link">VIEW PROGRAM →</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
