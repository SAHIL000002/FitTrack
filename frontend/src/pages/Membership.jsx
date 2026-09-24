import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { MEMBERSHIP_PLANS, MEMBERSHIP_SPECIAL, MEMBERSHIP_COMPARISON, MEMBERSHIP_BENEFITS, MEMBERSHIP_STEPS } from '../data/membershipData.js';

const HERO_BG = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop';

function PlanCard({ plan }) {
  return (
    <article className={`ft-plan-card ${plan.popular ? 'is-popular' : ''}`}>
      {plan.popular && <span className="ft-plan-flag">{plan.badge || 'BEST VALUE'}</span>}
      <div className="ft-plan-top">
        <div className="ft-plan-name">{plan.name}</div>
        <div className="ft-plan-dur">{plan.durationMonths}-MONTH ACCESS</div>
      </div>
      <div className="ft-plan-amount">{plan.priceDisplay}</div>
      <div className="ft-plan-billing">{plan.billingLabel}</div>
      <p className="ft-plan-desc">{plan.description}</p>
      <ul className="ft-plan-list">
        {plan.features.map((f) => (
          <li key={f}><span className="tick" aria-hidden="true">✓</span>{f}</li>
        ))}
      </ul>
      <Link to="/contact" className={`ft-btn ${plan.popular ? 'ft-btn-primary' : 'ft-btn-ghost'} ft-plan-btn`} aria-label={`Choose the ${plan.name} plan`}>
        CHOOSE PLAN →
      </Link>
      <div className="ft-plan-note">{plan.billingNote}</div>
    </article>
  );
}

export default function Membership() {
  const { columns, rows } = MEMBERSHIP_COMPARISON;
  return (
    <>
      <main>
        <PageHero eyebrow="FIT TRACK / MEMBERSHIP" title="CHOOSE YOUR COMMITMENT."
          lead="Train consistently. Build better habits. Choose the membership that fits the way you train."
          bg={HERO_BG} />
        <section className="ft-section surface" id="plans">
          <div className="ft-container">
            <SectionHeading kicker="Membership Plans" title="MEMBERSHIP OPTIONS."
              lead="Four durations. Same floor, same standards — pick the commitment that fits you." />
            <div className="ft-plans-grid">
              {MEMBERSHIP_PLANS.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 90}><PlanCard plan={p} /></Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <p className="ft-plans-note">Demo pricing shown. Final plans and payment options will be confirmed with the FIT TRACK team.</p>
            </Reveal>
          </div>
        </section>

        <section className="ft-section surface" id="special-plans">
          <div className="ft-container">
            <SectionHeading kicker="Offers & Add-Ons" title="STUDENT · COUPLE · PT ADD-ON."
              lead="Renewable student access, partner training and one-on-one coaching add-ons — demo pricing shown." />
            <div className="ft-plans-grid">
              {MEMBERSHIP_SPECIAL.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}><PlanCard plan={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="ft-section" id="included">
          <div className="ft-container">
            <SectionHeading kicker="Plan Comparison" title="WHAT'S INCLUDED."
              lead="Same foundation on every plan — longer commitments unlock more coaching support." />
            <Reveal>
              <div className="ft-compare-wrap">
                <table className="ft-compare">
                  <caption className="ft-compare-caption">Membership feature comparison across all four plans</caption>
                  <thead>
                    <tr>
                      <th scope="col">FEATURE</th>
                      {columns.map((c) => (<th scope="col" key={c}>{c}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.feature}>
                        <th scope="row">{r.feature}</th>
                        {r.values.map((v, i) => (
                          <td key={i}>{v
                            ? (<span className="ft-check" role="img" aria-label="Included">✓</span>)
                            : (<span className="ft-dash" aria-label="Not included">—</span>)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section surface" id="why">
          <div className="ft-container">
            <SectionHeading kicker="Membership Benefits" title="WHY FIT TRACK."
              lead="A training environment built for people who show up." />
            <Reveal>
              <div className="ft-benefits">
                {MEMBERSHIP_BENEFITS.map((b, i) => (
                  <div className="ft-benefit" key={b.k}>
                    <span className="ft-benefit-num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{b.k}</h3>
                    <p>{b.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section" id="how">
          <div className="ft-container">
            <SectionHeading kicker="Membership Process" title="HOW IT WORKS."
              lead="Three steps. No complicated onboarding." />
            <Reveal>
              <div className="ft-steps ft-steps-3">
                {MEMBERSHIP_STEPS.map((s) => (
                  <div className="ft-step" key={s.n}>
                    <span className="ft-step-num">{s.n}</span>
                    <h3>{s.k}</h3>
                    <p>{s.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ft-section alt" id="membership-philosophy">
          <div className="ft-quote">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Membership Philosophy</div>
              <blockquote>COMMITMENT BEATS<br /><span style={{ color: 'var(--lime)' }}>EXCITEMENT.</span></blockquote>
              <p className="ft-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
                Anyone can start. Members keep showing up — the plan just removes the excuses.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ft-cta" id="membership-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Ready To Commit?</div>
              <h2>YOUR MEMBERSHIP IS JUST THE START.</h2>
              <p>Pick a duration, talk to the team, and start your first training block this week.</p>
              <div className="ft-cta-btns">
                <Link to="/contact" className="ft-btn ft-btn-primary">START TRAINING →</Link>
                <Link to="/contact" className="ft-btn ft-btn-ghost">TALK TO FIT TRACK</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
