import { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { fmtD, gm, inr } from '../components/memberFormat.js';
import { getMyPayments } from '../services/paymentService';
const LIMIT = 10;
const ST = { PENDING: 'ft-pill-pending', PAID: 'ft-pill-active', FAILED: 'ft-pill-inactive', REFUNDED: 'ft-pill-inactive' };
export default function MemberPayments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyPayments({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  return (
    <MemberLayout title="PAYMENTS" subtitle="YOUR PAYMENT HISTORY">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : rows.length === 0 ? (
        <EmptyBox kicker="NO PAYMENT HISTORY" text="No payments found for your account." />
      ) : (
        <>
          <div className="ft-members-table-wrap"><table className="ft-members-table">
            <thead><tr><th>DATE</th><th>AMOUNT</th><th>METHOD</th><th>STATUS</th><th>TXN ID</th><th>PLAN</th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p._id}><td className="ft-mono">{fmtD(p.paymentDate)}</td><td className="ft-mono">{inr(p.amount)} {p.currency || ''}</td><td className="ft-mono">{p.method || 'â€”'}</td><td><span className={`ft-pill ${ST[p.status] || 'ft-pill-inactive'}`}>{p.status}</span></td><td className="ft-mono">{p.transactionId || 'â€”'}</td><td className="ft-mono">{p.membership?.plan?.name || 'â€”'}</td></tr>
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
    </MemberLayout>
  );
}
