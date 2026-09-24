import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { fmtD, gm, inr, daysRemaining } from '../components/memberFormat.js';
import { getMyActiveMembership, getMyMemberships } from '../services/membershipService';
export default function MemberMembership() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [hist, setHist] = useState([]);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [a, h] = await Promise.all([getMyActiveMembership(), getMyMemberships()]);
      setActive(a?.data || null); setHist(h?.data || []);
    } catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
   
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  const days = daysRemaining(active?.endDate);
  return (
    <MemberLayout title="MY MEMBERSHIP" subtitle="YOUR CURRENT PLAN AND HISTORY">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          {!active ? (
            <EmptyBox kicker="NO ACTIVE MEMBERSHIP" text="You have no active membership. Browse plans or contact the gym." action={<div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}><Link to="/member/plans" className="ft-btn ft-btn-primary">VIEW PLANS</Link><Link to="/member/enquiries" className="ft-btn ft-btn-ghost">CONTACT GYM</Link></div>} />
          ) : (
            <div className="ft-detail-grid" style={{ marginBottom: 24 }}>
              <section className="ft-detail-card">
                <div className="ft-kicker">CURRENT PLAN</div>
                <div className="ft-title" style={{ fontSize: 28 }}>{active.plan?.name || 'â€”'}</div>
                <dl className="ft-detail-list">
                  <div><dt>STATUS</dt><dd><span className="ft-pill ft-pill-active">{active.status}</span></dd></div>
                  <div><dt>START</dt><dd className="ft-mono">{fmtD(active.startDate)}</dd></div>
                  <div><dt>END</dt><dd className="ft-mono">{fmtD(active.endDate)}</dd></div>
                  <div><dt>DAYS LEFT</dt><dd className="ft-mono">{days == null ? 'â€”' : days}</dd></div>
                  <div><dt>AMOUNT</dt><dd className="ft-mono">{inr(active.amount)}</dd></div>
                  <div><dt>AUTO RENEW</dt><dd className="ft-mono">{active.autoRenew ? 'YES' : 'NO'}</dd></div>
                  {active.notes ? <div><dt>NOTES</dt><dd>{active.notes}</dd></div> : null}
                </dl>
              </section>
              <section className="ft-detail-card">
                <div className="ft-kicker">RENEWAL</div>
                <p style={{ color: 'var(--text-muted)' }}>To renew or change your plan, send an enquiry. The gym owner will arrange your membership.</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <Link to="/member/plans" className="ft-btn ft-btn-ghost">VIEW PLANS</Link>
                  <Link to="/member/enquiries" className="ft-btn ft-btn-primary">ENQUIRE ABOUT RENEWAL</Link>
                </div>
              </section>
            </div>
          )}
          <div className="ft-kicker">MEMBERSHIP HISTORY ({hist.length})</div>
          {hist.length === 0 ? <EmptyBox kicker="NO MEMBERSHIP HISTORY" text="No membership records found." /> : (
            <div className="ft-members-table-wrap"><table className="ft-members-table">
              <thead><tr><th>PLAN</th><th>START</th><th>END</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
              <tbody>{hist.map((m) => (
                <tr key={m._id}><td style={{ color: 'var(--white)', fontWeight: 700 }}>{m.plan?.name || 'â€”'}</td><td className="ft-mono">{fmtD(m.startDate)}</td><td className="ft-mono">{fmtD(m.endDate)}</td><td className="ft-mono">{inr(m.amount)}</td><td><span className={`ft-pill ${m.status === 'ACTIVE' ? 'ft-pill-active' : 'ft-pill-inactive'}`}>{m.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          )}
        </>
      )}
    </MemberLayout>
  );
}
