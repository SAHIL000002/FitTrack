import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { listMembers } from '../services/memberService';
import { listMemberships } from '../services/membershipService';
import { listPayments } from '../services/paymentService';
import { listAttendance } from '../services/attendanceService';
import { listEnquiries } from '../services/enquiryService';

function fmtD(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtT(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const ST_BADGE = {
  ACTIVE: 'ft-pill-active',
  PAID: 'ft-pill-active',
  PRESENT: 'ft-pill-active',
  PENDING: 'ft-pill-pending',
  NEW: 'ft-pill-pending',
  IN_PROGRESS: 'ft-pill-pending',
  RESOLVED: 'ft-pill-active',
  CLOSED: 'ft-pill-inactive',
  FAILED: 'ft-pill-inactive',
  ABSENT: 'ft-pill-inactive',
  LATE: 'ft-pill-pending',
  EXPIRED: 'ft-pill-inactive',
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    activeMemberships: 0,
    todayAttendance: 0,
    revenue: 0,
    pendingEnquiries: 0,
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersRes, activeMembersRes, membershipsRes, attendRes, paymentsRes, enquiriesRes] = await Promise.allSettled([
        listMembers({ limit: 1 }),
        listMembers({ status: 'active', limit: 1 }),
        listMemberships({ status: 'ACTIVE', limit: 1 }),
        listAttendance({ date: 'today', limit: 10 }),
        listPayments({ limit: 10 }),
        listEnquiries({ status: 'NEW', limit: 10 }),
      ]);

      // Total members
      const totalMembers = membersRes.status === 'fulfilled' ? membersRes.value?.meta?.total ?? 0 : 0;
      const activeMembers = activeMembersRes.status === 'fulfilled' ? activeMembersRes.value?.meta?.total ?? 0 : 0;
      const activeMemberships = membershipsRes.status === 'fulfilled' ? membershipsRes.value?.meta?.total ?? 0 : 0;
      const todayAttendanceCount = attendRes.status === 'fulfilled' ? attendRes.value?.meta?.total ?? (attendRes.value?.data?.length || 0) : 0;
      const pendingEnquiries = enquiriesRes.status === 'fulfilled' ? enquiriesRes.value?.meta?.total ?? 0 : 0;

      // Revenue calculation from recent paid payments or query
      const paymentsData = paymentsRes.status === 'fulfilled' ? paymentsRes.value?.data || [] : [];
      let calculatedRevenue = 0;
      if (paymentsData.length > 0) {
        calculatedRevenue = paymentsData.reduce((acc, p) => acc + (p.status === 'PAID' ? Number(p.amount || 0) : 0), 0);
      }

      setMetrics({
        totalMembers,
        activeMembers,
        activeMemberships,
        todayAttendance: todayAttendanceCount,
        revenue: calculatedRevenue,
        pendingEnquiries,
      });

      setRecentPayments(paymentsData.slice(0, 5));
      setTodayAttendance(attendRes.status === 'fulfilled' ? (attendRes.value?.data || []).slice(0, 5) : []);
      setRecentEnquiries(enquiriesRes.status === 'fulfilled' ? (enquiriesRes.value?.data || []).slice(0, 5) : []);
    } catch (err) {
      setError(err?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <OwnerLayout title="OWNER DASHBOARD" subtitle={`Welcome back, ${user?.name || user?.email || 'Owner'}. Real-time overview of your gym.`}>
      {loading ? (
        <div className="ft-members-skeleton">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ft-skeleton-row" style={{ height: '80px' }} />
            ))}
          </div>
          <div className="ft-skeleton-row" style={{ height: '240px' }} />
        </div>
      ) : error ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD DATA</div>
          <p>{error}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadDashboard}>
            RETRY
          </button>
        </div>
      ) : (
        <>
          {/* Real Metrics Grid */}
          <div className="ft-payments-metrics" style={{ marginBottom: '24px' }}>
            <div className="ft-stat-card">
              <div className="ft-stat-value">{metrics.totalMembers}</div>
              <div className="ft-stat-label">TOTAL MEMBERS</div>
            </div>
            <div className="ft-stat-card">
              <div className="ft-stat-value">{metrics.activeMembers}</div>
              <div className="ft-stat-label">ACTIVE MEMBERS</div>
            </div>
            <div className="ft-stat-card">
              <div className="ft-stat-value">{metrics.activeMemberships}</div>
              <div className="ft-stat-label">ACTIVE MEMBERSHIPS</div>
            </div>
            <div className="ft-stat-card">
              <div className="ft-stat-value">{metrics.todayAttendance}</div>
              <div className="ft-stat-label">TODAY'S ATTENDANCE</div>
            </div>
            <div className="ft-stat-card">
              <div className="ft-stat-value">₹{metrics.revenue.toFixed(2)}</div>
              <div className="ft-stat-label">RECORDED REVENUE</div>
            </div>
            <div className="ft-stat-card">
              <div className="ft-stat-value">{metrics.pendingEnquiries}</div>
              <div className="ft-stat-label">PENDING ENQUIRIES</div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <section className="ft-detail-card ft-detail-wide" style={{ marginBottom: '24px' }}>
            <div className="ft-kicker" style={{ marginBottom: '12px' }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Link to="/owner/members" className="ft-btn ft-btn-primary">+ ADD MEMBER</Link>
              <Link to="/owner/memberships" className="ft-btn ft-btn-ghost">+ ASSIGN MEMBERSHIP</Link>
              <Link to="/owner/payments" className="ft-btn ft-btn-ghost">+ RECORD PAYMENT</Link>
              <Link to="/owner/attendance" className="ft-btn ft-btn-ghost">+ MARK ATTENDANCE</Link>
              <Link to="/owner/trainers" className="ft-btn ft-btn-ghost">+ ADD TRAINER</Link>
              <Link to="/owner/programs" className="ft-btn ft-btn-ghost">+ ADD PROGRAM</Link>
            </div>
          </section>

          {/* Two-column Real Data Layout */}
          <div className="ft-detail-grid" style={{ marginBottom: '24px' }}>
            {/* Recent Payments */}
            <section className="ft-detail-card ft-detail-wide">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="ft-kicker" style={{ margin: 0 }}>RECENT PAYMENTS</div>
                <Link to="/owner/payments" className="ft-link" style={{ fontSize: '12px' }}>VIEW ALL PAYMENTS →</Link>
              </div>
              {recentPayments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>NO RECENT PAYMENTS FOUND</p>
              ) : (
                <div className="ft-members-table-wrap">
                  <table className="ft-members-table">
                    <thead>
                      <tr>
                        <th>MEMBER</th>
                        <th>AMOUNT</th>
                        <th>METHOD</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <Link to={`/owner/members/${p.user?._id || ''}`} className="ft-member-name">
                              {p.user?.name || '—'}
                            </Link>
                          </td>
                          <td className="ft-mono">₹{p.amount != null ? Number(p.amount).toFixed(2) : '—'}</td>
                          <td className="ft-mono">{(p.method || '—').replace(/_/g, ' ')}</td>
                          <td>
                            <span className={`ft-pill ${ST_BADGE[p.status] || 'ft-pill-inactive'}`}>{p.status}</span>
                          </td>
                          <td className="ft-mono">{fmtD(p.paymentDate || p.createdAt)}</td>
                          <td>
                            <Link to={`/owner/payments/${p._id}`} className="ft-link">VIEW</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Today's Attendance */}
            <section className="ft-detail-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="ft-kicker" style={{ margin: 0 }}>TODAY'S ATTENDANCE</div>
                <Link to="/owner/attendance" className="ft-link" style={{ fontSize: '12px' }}>ATTENDANCE SHEET →</Link>
              </div>
              {todayAttendance.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>NO ATTENDANCE LOGGED TODAY</p>
              ) : (
                <div className="ft-members-table-wrap">
                  <table className="ft-members-table">
                    <thead>
                      <tr>
                        <th>MEMBER</th>
                        <th>CHECK IN</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendance.map((a) => (
                        <tr key={a._id}>
                          <td>
                            <Link to={`/owner/members/${a.user?._id || ''}`} className="ft-member-name">
                              {a.user?.name || '—'}
                            </Link>
                          </td>
                          <td className="ft-mono">{a.checkIn ? fmtT(a.checkIn) : '—'}</td>
                          <td>
                            <span className={`ft-pill ${ST_BADGE[a.status] || 'ft-pill-inactive'}`}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Recent Enquiries */}
          <section className="ft-detail-card ft-detail-wide">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="ft-kicker" style={{ margin: 0 }}>PENDING ENQUIRIES</div>
              <Link to="/owner/enquiries" className="ft-link" style={{ fontSize: '12px' }}>ALL ENQUIRIES →</Link>
            </div>
            {recentEnquiries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>NO PENDING ENQUIRIES</p>
            ) : (
              <div className="ft-members-table-wrap">
                <table className="ft-members-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnquiries.map((enq) => (
                      <tr key={enq._id}>
                        <td style={{ color: 'var(--white)', fontWeight: 600 }}>{enq.name}</td>
                        <td className="ft-mono">{enq.email}</td>
                        <td className="ft-mono">{(enq.enquiryType || '—').replace(/_/g, ' ')}</td>
                        <td>
                          <span className={`ft-pill ${ST_BADGE[enq.status] || 'ft-pill-inactive'}`}>{enq.status}</span>
                        </td>
                        <td className="ft-mono">{fmtD(enq.createdAt)}</td>
                        <td>
                          <Link to={`/owner/enquiries/${enq._id}`} className="ft-link">VIEW</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </OwnerLayout>
  );
}
