import { Link } from 'react-router-dom';

const BG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop';

export default function MembershipCTA() {
  return (
    <section className="ft-cta" id="membership">
      <div className="ft-cta-bg"><img src={BG} alt="Elite gym floor" loading="lazy" /></div>
      <div className="ft-cta-inner">
        <div className="ft-kicker">Secure Your Access</div>
        <h2>STOP WATCHING. START TRAINING.</h2>
        <p>Join FIT TRACK today and gain full access to all training zones, professional equipment and elite coaching infrastructure.</p>
        <div className="ft-cta-btns">
          <Link to="/membership" className="ft-btn ft-btn-primary">JOIN FIT TRACK NOW →</Link>
          <a href="#visit" className="ft-btn ft-btn-ghost">BOOK A FACILITY TOUR</a>
        </div>
      </div>
    </section>
  );
}
