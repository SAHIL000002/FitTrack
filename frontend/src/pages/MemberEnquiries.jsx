import { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox, Notice } from '../components/memberUi.jsx';
import { fmtD, gm } from '../components/memberFormat.js';
import { useAuth } from '../context/AuthContext';
import { getMyEnquiries, createEnquiry } from '../services/enquiryService';
const TYPES = ['MEMBERSHIP', 'PERSONAL_TRAINING', 'PROGRAMS', 'GENERAL_QUESTION'];
const CONTACTS = ['EMAIL', 'PHONE'];
const LIMIT = 10;
export default function MemberEnquiries() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [ok, setOk] = useState(true);
  const [form, setForm] = useState({ enquiryType: 'MEMBERSHIP', preferredContact: 'EMAIL', message: '' });
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyEnquiries({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  const submit = async (e) => {
    e.preventDefault(); if (busy) return; setBusy(true);
    setNotice(null);
    try {
      await createEnquiry({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', enquiryType: form.enquiryType, preferredContact: form.preferredContact, message: form.message });
      setNotice('Enquiry submitted.'); setOk(true);
      setForm({ enquiryType: 'MEMBERSHIP', preferredContact: 'EMAIL', message: '' });
      setPage(1); await load();
    } catch (err) { setNotice(gm(err)); setOk(false); }
    finally { setBusy(false); }
  };
  return (
    <MemberLayout title="ENQUIRIES" subtitle="ASK THE GYM ANYTHING">
      <Notice text={notice} ok={ok} />
      <section className="ft-detail-card" style={{ marginBottom: 24 }}>
        <div className="ft-kicker">NEW ENQUIRY</div>
        <form onSubmit={submit}>
          <div className="ft-form-grid">
            <div className="ft-field"><label>ENQUIRY TYPE</label><select value={form.enquiryType} onChange={(e) => setForm((f) => ({ ...f, enquiryType: e.target.value }))}>{TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
            <div className="ft-field"><label>PREFERRED CONTACT</label><select value={form.preferredContact} onChange={(e) => setForm((f) => ({ ...f, preferredContact: e.target.value }))}>{CONTACTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div className="ft-field"><label>MESSAGE (MIN 10 CHARS)</label><textarea rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="How can the gym help?" required minLength={10} /></div>
          <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>{busy ? 'SENDINGâ€¦' : 'SUBMIT ENQUIRY'}</button>
        </form>
      </section>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : rows.length === 0 ? (
        <EmptyBox kicker="NO ENQUIRIES" text="You have not submitted any enquiries yet." />
      ) : (
        <>
          <div className="ft-members-table-wrap"><table className="ft-members-table">
            <thead><tr><th>TYPE</th><th>MESSAGE</th><th>CONTACT</th><th>STATUS</th><th>DATE</th></tr></thead>
            <tbody>{rows.map((q) => (
              <tr key={q._id}><td className="ft-mono">{(q.enquiryType || 'â€”').replace(/_/g, ' ')}</td><td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.message}</td><td className="ft-mono">{q.preferredContact || 'â€”'}</td><td><span className="ft-pill ft-pill-pending">{q.status}</span></td><td className="ft-mono">{fmtD(q.createdAt)}</td></tr>
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
