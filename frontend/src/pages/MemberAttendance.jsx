import { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout.jsx';
import { StatCard, Skeleton, ErrorBox, EmptyBox, Notice } from '../components/memberUi.jsx';
import { fmtD, fmtT, gm } from '../components/memberFormat.js';
import { getMyAttendance, checkIn, checkOut } from '../services/attendanceService';
const LIMIT = 10;
const ST = { PRESENT: 'ft-pill-active', ABSENT: 'ft-pill-inactive', LATE: 'ft-pill-pending', EXCUSED: 'ft-pill-pending', CLEARED: 'ft-pill-inactive' };
export default function MemberAttendance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noticeOk, setNoticeOk] = useState(true);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyAttendance({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  const say = (t, ok) => { setNotice(t); setNoticeOk(ok !== false); };
  const doIn = async () => {
    if (busy) return; setBusy(true);
    try { await checkIn({}); say('Checked in successfully.'); setPage(1); await load(); }
    catch (e) { say(gm(e), false); }
    finally { setBusy(false); }
  };
  const doOut = async () => {
    if (busy) return; setBusy(true);
    try { await checkOut(); say('Checked out successfully.'); await load(); }
    catch (e) { say(gm(e), false); }
    finally { setBusy(false); }
  };
  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const late = rows.filter((r) => r.status === 'LATE').length;
  return (
    <MemberLayout title="ATTENDANCE" subtitle="YOUR GYM CHECK-INS">
      <Notice text={notice} ok={noticeOk} />
      <div className="ft-detail-actions">
        <button type="button" className="ft-btn ft-btn-primary" onClick={doIn} disabled={busy}>CHECK IN</button>
        <button type="button" className="ft-btn ft-btn-ghost" onClick={doOut} disabled={busy}>CHECK OUT</button>
      </div>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          <div className="ft-stat-row" style={{ marginBottom: 24 }}>
            <StatCard label="TOTAL RECORDS" value={meta.total} />
            <StatCard label="PRESENT (PAGE)" value={present} />
            <StatCard label="LATE (PAGE)" value={late} />
          </div>
          {rows.length === 0 ? <EmptyBox kicker="NO ATTENDANCE RECORDS" text="No attendance records found." /> : (
            <>
              <div className="ft-members-table-wrap"><table className="ft-members-table">
                <thead><tr><th>DATE</th><th>CHECK IN</th><th>CHECK OUT</th><th>STATUS</th></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r._id}><td className="ft-mono">{fmtD(r.date)}</td><td className="ft-mono">{fmtT(r.checkIn)}</td><td className="ft-mono">{fmtT(r.checkOut)}</td><td><span className={`ft-pill ${ST[r.status] || 'ft-pill-inactive'}`}>{r.status}</span></td></tr>
                ))}</tbody>
              </table></div>
              <div className="ft-pagination">
                <span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages || 0} Â· TOTAL {meta.total}</span>
                <div className="ft-pagination-btns">
                  <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={page <= 1}>PREVIOUS</button>
                  <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => x + 1)} disabled={page >= meta.pages}>NEXT</button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </MemberLayout>
  );
}
