import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { gm, inr } from '../components/memberFormat.js';
import { listMembershipPlans } from '../services/membershipService';
export default function MemberPlans() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await listMembershipPlans({ limit: 100 }); setPlans(b?.data || []); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
   
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  return (
    <MemberLayout title="MEMBERSHIP PLANS" subtitle="ACTIVE PLANS AVAILABLE AT YOUR GYM">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : plans.length === 0 ? (
        <EmptyBox kicker="NO PLANS AVAILABLE" text="No membership plans are published right now." />
      ) : (
        <div className="ft-members-grid">
          {plans.map((p) => (
            <article key={p._id} className="ft-member-card">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                {(p.popular || p.featured) ? <span className="ft-tag">POPULAR</span> : null}
                {p.badge ? <span className="ft-tag">{p.badge}</span> : null}
                <span className="ft-mono" style={{ color: 'var(--text-faint)' }}>{p.durationMonths} MONTHS</span>
              </div>
              <div className="ft-title" style={{ fontSize: 26, marginBottom: 4 }}>{p.name}</div>
              <div className="ft-stat-value" style={{ fontSize: 30 }}>{inr(p.price)}</div>
              <div className="ft-mono" style={{ color: 'var(--text-faint)', marginBottom: 8 }}>{p.billingLabel || ''} {p.billingNote || ''}</div>
              {p.description ? <p style={{ color: 'var(--text-muted)' }}>{p.description}</p> : null}
              {(p.features || []).length > 0 ? (
                <ul style={{ color: 'var(--text-muted)', paddingLeft: 18, margin: '0 0 16px' }}>
                  {p.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              ) : null}
              <Link to="/member/enquiries" className="ft-btn ft-btn-primary">ENQUIRE ABOUT PLAN</Link>
            </article>
          ))}
        </div>
      )}
    </MemberLayout>
  );
}
