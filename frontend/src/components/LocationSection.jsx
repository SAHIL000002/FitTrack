const MAP = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop';

export default function LocationSection() {
  return (
    <section className="ft-section" id="visit">
      <div className="ft-container ft-loc-grid">
        <div>
          <div className="ft-kicker">Location &amp; Hours</div>
          <h2 className="ft-title">VISIT THE FACILITY.</h2>
          <div style={{ margin: '24px 0 32px' }}>
            <h3 className="ft-loc-h">ADDRESS</h3>
            <p>742 Industrial Parkway, Sector 4, Los Angeles, CA 90021</p>
            <h3 className="ft-loc-h" style={{ marginTop: 20 }}>OPERATING HOURS</h3>
            <p>Monday — Sunday: 05:00 — 23:00</p>
            <p style={{ fontSize: 14, color: 'var(--lime)' }}>Open 365 days a year including holidays.</p>
          </div>
          <a className="ft-btn ft-btn-ghost" href="https://maps.google.com" target="_blank" rel="noreferrer">GET DIRECTIONS →</a>
        </div>
        <div className="ft-map">
          <img src={MAP} alt="Facility location map" loading="lazy" />
          <div className="ft-map-badge"><span className="ft-dot" /> FIT TRACK HQ</div>
        </div>
      </div>
    </section>
  );
}
