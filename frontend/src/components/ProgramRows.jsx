const ROWS = [
  { k: 'APEX STRENGTH EXPERIENCE', t: '12-week barbell progression', d: 'Squat / bench / deadlift waves with coach-reviewed technique blocks.', m: 'STRENGTH // 60–90 MIN' },
  { k: 'TACTICAL ENGINE & CONDITIONING', t: 'Build an unbreakable engine', d: 'Erg intervals, sled pushes and zone-2 capacity work, tracked weekly.', m: 'ENGINE // 45 MIN' },
  { k: 'HYPERTROPHY / BODYBUILDING', t: 'Sculpt dense, balanced muscle', d: 'Split-based volume training with strict tempo and recovery protocol.', m: 'HYPERTROPHY // ALL LEVELS' },
];

export default function ProgramRows() {
  return (
    <section className="ft-section" id="train-with-intent">
      <div className="ft-container">
        <div className="ft-head-row">
          <div>
            <div className="ft-kicker">Structured Coaching</div>
            <h2 className="ft-title">TRAIN WITH INTENT.</h2>
          </div>
          <p className="ft-lead">Progression plans designed to add absolute strength, carve muscle and build work capacity.</p>
        </div>
        <div className="ft-rows">
          {ROWS.map((r) => (
            <div className="ft-row" key={r.k}>
              <div><h4>{r.k}</h4><h3>{r.t}</h3><p>{r.d}</p></div>
              <div className="meta">{r.m}<br />→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
