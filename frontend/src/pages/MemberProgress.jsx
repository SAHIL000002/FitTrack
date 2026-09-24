import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Notice, Skeleton, ErrorBox } from '../components/memberUi.jsx';

import { EmptyBox } from '../components/memberUi.jsx';
import { fmtD, gm } from '../components/memberFormat.js';
import { getMyProgress, createMyProgress } from '../services/progressService';
import { updateMyProgress, deleteMyProgress } from '../services/progressService';
const LIMIT = 10;
export function MemberProgress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [ok, setOk] = useState(true);
  const [form, setForm] = useState({ date: '', weight: '', bodyFat: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyProgress({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  const say = (t, good) => { setNotice(t); setOk(good !== false); };
  const submit = async (e) => {
    e.preventDefault(); if (busy) return; setBusy(true);
    const p = {};
    if (form.date) p.date = form.date;
    if (form.weight !== '') p.weight = Number(form.weight);
    if (form.bodyFat !== '') p.bodyFat = Number(form.bodyFat);
    if (form.notes) p.notes = form.notes;
    try {
      if (editId) { await updateMyProgress(editId, p); say('Progress updated.'); }
      else { await createMyProgress(p); say('Progress logged.'); }
      setForm({ date: '', weight: '', bodyFat: '', notes: '' }); setEditId(null); await load();
    } catch (err) { say(gm(err), false); }
    finally { setBusy(false); }
  };
  const del = async (id) => {
    if (busy) return; if (!window.confirm('Delete this record?')) return;
    setBusy(true);
    try { await deleteMyProgress(id); say('Progress deleted.'); await load(); }
    catch (e) { say(gm(e), false); }
    finally { setBusy(false); }
  };
  const ed = (r) => { setEditId(r._id); setForm({ date: r.date ? String(r.date).slice(0, 10) : '', weight: r.weight ?? '', bodyFat: r.bodyFat ?? '', notes: r.notes || '' }); window.scrollTo(0, 0); };
  const ws = [...rows].reverse().map((r) => r.weight).filter((v) => typeof v === 'number');
  let trend = null;
  if (ws.length >= 2) {
    const mn = Math.min(...ws); const mx = Math.max(...ws); const sp = mx - mn || 1;
    const pts = ws.map((v, i) => `${10 + (i / (ws.length - 1)) * 280},${44 - ((v - mn) / sp) * 36}`).join(' ');
    trend = <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: 12, marginBottom: 16 }}><div className="ft-mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>WEIGHT TREND (KG)</div><svg viewBox="0 0 300 52" style={{ width: '100%', height: 80 }}><polyline points={pts} fill="none" stroke="#bff525" strokeWidth="2" /></svg></div>;
  }
  return (
    <MemberLayout title="PROGRESS" subtitle="TRACK YOUR FITNESS JOURNEY">
      <Notice text={notice} ok={ok} />
      <section className="ft-detail-card" style={{ marginBottom: 24 }}>
        <div className="ft-kicker">{editId ? 'EDIT PROGRESS' : 'LOG PROGRESS'}</div>
        <form onSubmit={submit}>
          <div className="ft-form-grid">
            <div className="ft-field"><label>DATE</label><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
            <div className="ft-field"><label>WEIGHT (KG)</label><input type="number" min="0" step="0.1" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} /></div>
            <div className="ft-field"><label>BODY FAT (%)</label><input type="number" min="0" max="100" step="0.1" value={form.bodyFat} onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} /></div>
          </div>
          <div className="ft-field"><label>NOTES</label><textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>{busy ? 'SAVINGâ€¦' : editId ? 'SAVE' : 'LOG PROGRESS'}</button>
            {editId ? <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setEditId(null); setForm({ date: '', weight: '', bodyFat: '', notes: '' }); }}>CANCEL</button> : null}
          </div>
        </form>
      </section>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : rows.length === 0 ? <EmptyBox kicker="NO PROGRESS RECORDS" text="No progress logged yet." /> : (<>
        {trend}
        <div className="ft-members-table-wrap"><table className="ft-members-table">
          <thead><tr><th>DATE</th><th>WEIGHT</th><th>BODY FAT</th><th>ACTION</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r._id}><td className="ft-mono">{fmtD(r.date)}</td><td className="ft-mono">{r.weight ?? 'â€”'}</td><td className="ft-mono">{r.bodyFat ?? 'â€”'}</td>
              <td><div className="ft-row-actions"><Link to={`/member/progress/${r._id}`} className="ft-link">VIEW</Link><button type="button" className="ft-link" onClick={() => ed(r)}>EDIT</button><button type="button" className="ft-link ft-link-danger" onClick={() => del(r._id)}>DELETE</button></div></td></tr>
          ))}</tbody>
        </table></div>
        <div className="ft-pagination"><span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages || 0} Â· TOTAL {meta.total}</span>
          <div className="ft-pagination-btns"><button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={page <= 1}>PREV</button><button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((x) => x + 1)} disabled={page >= meta.pages}>NEXT</button></div>
        </div>
      </>)}
    </MemberLayout>
  );
}
