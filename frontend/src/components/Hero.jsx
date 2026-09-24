import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const WORDS = ['STRONGER', 'DISCIPLINED', 'POWERFUL', 'CONSISTENT', 'UNSTOPPABLE'];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('show');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => {
      setPhase('exit');
      setTimeout(() => {
        setIdx((i) => (i + 1) % WORDS.length);
        setPhase('enter');
        setTimeout(() => setPhase('show'), 500);
      }, 450);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="ft-hero" id="home">
      <div className="ft-hero-bg" aria-hidden="true" />
      <div className="ft-hero-top">
        <span className="ft-tag"><span className="ft-dot" /> FIT TRACK / PERFORMANCE FACILITY</span>
        <div className="ft-hero-coords">EST. 2014 — STRENGTH / CONDITIONING<br />SECTOR 04 / STRENGTH WING</div>
      </div>
      <div className="ft-hero-main">
        <div className="ft-hero-copy">
          <h1 className="ft-hero-title" aria-label={`Build a ${WORDS[idx]} version of you.`}>
            <span className="ft-hero-line">BUILD A</span>
            <span className="ft-hero-line dyn" aria-hidden="true">
              <span className={`ft-dyn-word ${phase === 'exit' ? 'is-exit' : phase === 'enter' ? 'is-enter' : ''}`}>
                {WORDS[idx]}
              </span>
            </span>
            <span className="ft-hero-line">VERSION OF YOU.</span>
          </h1>
          <p className="ft-hero-sub">Your limits are not permanent.<br />Your discipline decides what comes next.</p>
          <div className="ft-hero-cta">
            <Link to="/membership" className="ft-btn ft-btn-primary">START YOUR JOURNEY →</Link>
            <a href="#facility" className="ft-btn ft-btn-ghost">EXPLORE FIT TRACK</a>
          </div>
          <div className="ft-hero-metrics">
            <div><b>10K+</b><span>ACTIVE MEMBERS</span></div>
            <div><b>25+</b><span>EXPERT TRAINERS</span></div>
            <div><b>50+</b><span>PROGRAMS</span></div>
          </div>
        </div>
      </div>
      <div className="ft-hero-bottom">
        <span>EST. 2014 PERFORMANCE / STRENGTH / CONDITIONING</span>
        <span className="ft-scroll">SCROLL TO EXPLORE ↓</span>
      </div>
    </section>
  );
}

