import { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { fmtDT, gm } from '../components/memberFormat.js';
import { getMyNotifications, markMyNotificationRead } from '../services/notificationService';
const LIMIT = 10;
export default function MemberNotifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyNotifications({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  const mark = async (id) => {
    if (busy) return; setBusy(true);
    try { await markMyNotificationRead(id); setRows((r) => r.map((x) => (x._id === id ? { ...x, isRead: true } : x))); }
    catch (e) { setError(gm(e)); }
    finally { setBusy(false); }
  };
  return (
    <MemberLayout title="NOTIFICATIONS" subtitle="UPDATES FOR YOU">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : rows.length === 0 ? (
        <EmptyBox kicker="NO NOTIFICATIONS" text="You have no notifications." />
      ) : (
        <>
          <div className="ft-members-grid">
            {rows.map((n) => (
              <article key={n._id} className="ft-member-card" style={{ borderColor: n.isRead ? 'var(--border)' : 'var(--lime)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="ft-pill">{n.type || 'GENERAL'}</span>
                  <span className={`ft-pill ${n.isRead ? 'ft-pill-inactive' : 'ft-pill-pending'}`}>{n.isRead ? 'READ' : 'UNREAD'}</span>
                  <span className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: 11 }}>{fmtDT(n.createdAt)}</span>
                </div>
                <div style={{ color: 'var(--white)', fontWeight: 700 }}>{n.title || 'â€”'}</div>
                <p style={{ color: 'var(--text-muted)' }}>{n.message || ''}</p>
                {!n.isRead ? <button type="button" className="ft-link" onClick={() => mark(n._id)} disabled={busy}>MARK AS READ</button> : null}
              </article>
            ))}
          </div>
          <div className="ft-pagination">
            <span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages || 0} Â· TOTAL {meta.total}</span>
            <div className="ft-pagination-btns">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => x + 1)} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}
    </MemberLayout>
  );
}
