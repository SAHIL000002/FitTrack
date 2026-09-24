import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MemberLayout from '../components/MemberLayout.jsx';
import { StatCard, Skeleton, ErrorBox } from '../components/memberUi.jsx';
import { fmtD, gm, daysRemaining } from '../components/memberFormat.js';
import { getMyActiveMembership, getMyMemberships } from '../services/membershipService';
import { getMyAttendance } from '../services/attendanceService';
import { getMyWorkouts } from '../services/workoutService';
import { getMyProgress } from '../services/progressService';
import { getMyPayments } from '../services/paymentService';
import { getMyNotifications } from '../services/notificationService';

export default function MemberOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [c, setC] = useState({ m: 0, a: 0, w: 0, p: 0, pay: 0, un: 0 });
  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await Promise.allSettled([
        getMyActiveMembership(), getMyMemberships(), getMyAttendance({ limit: 1 }),
        getMyWorkouts({ limit: 1 }), getMyProgress({ limit: 1 }),
        getMyPayments({ limit: 1 }), getMyNotifications({ limit: 1 }),
      ]);
      if (r[0].status === 'fulfilled') setActive(r[0].value?.data || null);
      const n = (i) => (r[i].status === 'fulfilled' ? (r[i].value?.meta?.total ?? r[i].value?.data?.length ?? 0) : 0);
      setC({
        m: n(1), a: n(2), w: n(3), p: n(4), pay: n(5),
        un: r[6].status === 'fulfilled' ? (r[6].value?.data || []).filter((x) => !x.isRead).length : 0,
      });
    } catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
   
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  const days = daysRemaining(active?.endDate);
  const nm = user?.name ? ' â€” ' + String(user.name).toUpperCase() : '';
  return (
    <MemberLayout title="MEMBER DASHBOARD" subtitle={'YOUR WORK. YOUR PROGRESS. YOUR NEXT LEVEL.' + nm}>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          <div className="ft-stat-row" style={{ marginBottom: 24 }}>
            <StatCard label="MEMBERSHIP STATUS" value={active?.status || 'NONE'} sub={active?.plan?.name || 'NO ACTIVE PLAN'} />
            <StatCard label="DAYS REMAINING" value={days == null ? 'â€”' : days} sub={active ? 'EXPIRES ' + fmtD(active.endDate) : 'NO ACTIVE PLAN'} />
            <StatCard label="ATTENDANCE" value={c.a} sub="TOTAL RECORDS" />
            <StatCard label="WORKOUTS" value={c.w} sub="ASSIGNED" />
          </div>
          <div className="ft-stat-row" style={{ marginBottom: 24 }}>
            <StatCard label="PROGRESS" value={c.p} sub="RECORDS LOGGED" />
            <StatCard label="PAYMENTS" value={c.pay} sub="TOTAL RECORDS" />
            <StatCard label="UNREAD" value={c.un} sub="NOTIFICATIONS" />
            <StatCard label="MEMBERSHIPS" value={c.m} sub="TOTAL HISTORY" />
          </div>
          {!active ? (
            <div className="ft-empty" style={{ marginBottom: 24 }}>
              <div className="ft-kicker">NO ACTIVE MEMBERSHIP</div>
              <p>Browse membership plans or contact the gym to get started.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/member/plans" className="ft-btn ft-btn-primary">VIEW PLANS</Link>
                <Link to="/member/enquiries" className="ft-btn ft-btn-ghost">CONTACT GYM</Link>
              </div>
            </div>
          ) : (
            <section className="ft-detail-card" style={{ marginBottom: 24 }}>
              <div className="ft-kicker">CURRENT MEMBERSHIP</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'var(--white)', fontWeight: 700 }}>{active.plan?.name || 'â€”'}</span>
                <span className="ft-mono">{fmtD(active.startDate)} â†’ {fmtD(active.endDate)}</span>
                <Link to="/member/membership" className="ft-link">VIEW MEMBERSHIP</Link>
              </div>
            </section>
          )}
          <div className="ft-detail-grid">
            <section className="ft-detail-card">
              <div className="ft-kicker">QUICK ACTIONS</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/member/membership" className="ft-btn ft-btn-ghost">VIEW MEMBERSHIP</Link>
                <Link to="/member/attendance" className="ft-btn ft-btn-ghost">CHECK IN</Link>
                <Link to="/member/workouts" className="ft-btn ft-btn-ghost">VIEW WORKOUTS</Link>
                <Link to="/member/progress" className="ft-btn ft-btn-ghost">VIEW PROGRESS</Link>
                <Link to="/member/payments" className="ft-btn ft-btn-ghost">VIEW PAYMENTS</Link>
                <Link to="/member/enquiries" className="ft-btn ft-btn-ghost">CONTACT GYM</Link>
              </div>
            </section>
            <section className="ft-detail-card">
              <div className="ft-kicker">TODAY</div>
              <dl className="ft-detail-list">
                <div><dt>MEMBER</dt><dd style={{ color: 'var(--white)', fontWeight: 700 }}>{user?.name || 'â€”'}</dd></div>
                <div><dt>EMAIL</dt><dd className="ft-mono">{user?.email || 'â€”'}</dd></div>
                <div><dt>NEXT EXPIRY</dt><dd className="ft-mono">{active ? fmtD(active.endDate) : 'â€”'}</dd></div>
              </dl>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link to="/member/profile" className="ft-link">MY PROFILE</Link>
                <Link to="/member/settings" className="ft-link">GYM TIMINGS</Link>
              </div>
            </section>
          </div>
        </>
      )}
    </MemberLayout>
  );
}

