import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="ft-footer">
      <div className="ft-container">
        <div className="ft-footer-top">
          <div>
            <Link to="/" className="ft-footer-brand" aria-label="FIT TRACK home">
              <img className="ft-brand-logo" src="/logo.png" alt="FIT TRACK" width="1376" height="768" loading="lazy" />
            </Link>
            <div className="ft-footer-sub">BUILD WHAT YOU&apos;RE CAPABLE OF.</div>
          </div>
          <div className="ft-footer-links">
            <Link to="/programs">Programs</Link>
            <Link to="/equipment">Equipment</Link>
            <Link to="/trainers">Trainers</Link>
            <Link to="/membership">Membership</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="ft-footer-bottom">
          <span>© 2026 FIT TRACK. ALL RIGHTS RESERVED.</span>
          <nav><span>INSTAGRAM</span><span>YOUTUBE</span><span>STRAVA</span></nav>
        </div>
      </div>
    </footer>
  );
}
