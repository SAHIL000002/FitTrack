const STATS = [
  { v: '10,000+', l: 'ACTIVE MEMBERS' },
  { v: '50+', l: 'EQUIPMENT STATIONS' },
  { v: '25+', l: 'ELITE COACHES' },
  { v: '12+', l: 'YEARS OPERATING' },
  { v: '98%', l: 'MEMBER SATISFACTION' },
];

export default function StatsSection() {
  return (
    <section className="ft-section alt">
      <div className="ft-container">
        <div className="ft-kicker" style={{ textAlign: 'center' }}>Results &amp; Track Record</div>
        <h2 className="ft-title" style={{ textAlign: 'center', marginBottom: 40 }}>NUMBERS DON&apos;T LIE.</h2>
        <div className="ft-stats">
          {STATS.map((s) => (
            <div className="ft-stat" key={s.l}><b>{s.v}</b><span>{s.l}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
