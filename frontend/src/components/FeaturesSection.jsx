const IMG = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop';

export default function FeaturesSection() {
  return (
    <section className="ft-section" id="facility">
      <div className="ft-container ft-facility-grid">
        <div>
          <div className="ft-kicker">Facility Architecture</div>
          <h2 className="ft-title">THIS IS NOT A COMMERCIAL GYM.</h2>
          <p className="ft-lead">Designed by strength coaches and elite athletes. Every square foot of FIT TRACK is optimized for output, airflow and uncompromising focus.</p>
          <div className="ft-mini-stats">
            <div><b>18,000</b><span>SQ FT TRAINING FLOOR</span></div>
            <div><b>03</b><span>DEDICATED ZONES</span></div>
            <div><b>50+</b><span>STATIONS &amp; RIGS</span></div>
            <div><b>05:00</b><span>DAILY OPENING TIME</span></div>
          </div>
        </div>
        <div className="ft-frame">
          <img src={IMG} alt="Industrial gym interior with steel rigs" loading="lazy" />
          <div className="ft-frame-bar"><span className="a">MAIN STRENGTH WING / SECTOR A</span><span className="b">LIVE CAPACITY: 28%</span></div>
        </div>
      </div>
    </section>
  );
}
