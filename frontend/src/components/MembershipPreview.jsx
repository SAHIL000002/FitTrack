import { Link } from 'react-router-dom';
import { Reveal } from '../hooks/useReveal.jsx';

// Placeholder pricing — replace with real backend values in Phase 2.
const PLANS = [
  {
    id: 'monthly', name: 'MONTHLY', price: '₹999', per: 'per month',
    desc: 'Flexible start. Train full-access with zero long commitment.',
    benefits: ['Full Gym Access', 'Standard Equipment', 'Locker Access', 'Basic Support'],
    popular: false,
  },
  {
    id: 'quarterly', name: '3 MONTHS', price: '₹2,499', per: 'one-time / 3 months',
    desc: 'Build momentum with a focused 90-day training block.',
    benefits: ['Everything in Monthly', '1 PT Assessment', 'Diet Starter Chart', 'Progress Tracking'],
    popular: false,
  },
  {
    id: 'half-yearly', name: '6 MONTHS', price: '₹4,499', per: 'one-time / 6 months',
    desc: 'Serious consistency phase with coaching checkpoints.',
    benefits: ['Everything in 3 Months', 'Monthly PT Check-in', 'Custom Split Plan', 'Priority Support'],
    popular: true,
  },
  {
    id: 'yearly', name: 'YEARLY', price: '₹7,999', per: 'one-time / 12 months',
    desc: 'Full-year transformation track. Best value for committed athletes.',
    benefits: ['Everything in 6 Months', 'Quarterly Body Audit', 'Guest Passes x2', 'Merch Pack'],
    popular: false,
  },
];

export default function MembershipPreview() {
  return (
    <section className="ft-section surface" id="plans">
      <div className="ft-container">
        <Reveal>
          <div className="ft-head-row">
            <div>
              <div className="ft-kicker">Membership Preview</div>
              <h2 className="ft-title">CHOOSE YOUR PLAN.</h2>
            </div>
            <p className="ft-lead">Simple memberships. Serious results.</p>
          </div>
        </Reveal>
        <div className="ft-plans">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <article className={`ft-plan ${p.popular ? 'is-popular' : ''}`}>
                {p.popular && <span className="ft-plan-badge">MOST POPULAR</span>}
                <div className="ft-plan-name">{p.name}</div>
                <div className="ft-plan-price">{p.price}</div>
                <div className="ft-plan-per">{p.per}</div>
                <p className="ft-plan-desc">{p.desc}</p>
                <ul className="ft-plan-list">
                  {p.benefits.map((b) => (
                    <li key={b}><span className="tick">✓</span>{b}</li>
                  ))}
                </ul>
                <Link to="/membership" className={`ft-btn ${p.popular ? 'ft-btn-primary' : 'ft-btn-ghost'} ft-plan-btn`}>
                  VIEW PLAN →
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="ft-plans-foot">
            <Link to="/membership" className="ft-btn ft-btn-primary">EXPLORE MEMBERSHIP →</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
