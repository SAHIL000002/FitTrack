import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getEnquiry, patchEnquiryStatus, deleteEnquiry } from '../services/enquiryService';

const ENQ_STATUS = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ST = { NEW: 'ft-pill-pending', IN_PROGRESS: 'ft-pill-active', RESOLVED: 'ft-pill-active', CLOSED: 'ft-pill-inactive' };

function fmtD(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function gm(e) { return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong'; }

function SP({ status }) { return <span className={`ft-pill ${ST[status] || 'ft-pill-inactive'}`}>{status || '—'}</span>; }

export default function OwnerEnquiryDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [e, setE] = useState(null);
  const [ld, setLd] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let c = false;
    const l = async () => {
      setLd(true); setErr('');
      try {
        const b = await getEnquiry(id);
        if (!c) setE(b?.data || null);
      } catch (er) { if (!c) setErr(gm(er)); }
      finally { if (!c) setLd(false); }
    };
    l(); return () => { c = true; };
  }, [id]);

  const setStatus = async (s) => {
    if (!e || busy) return;
    setBusy(true);
    try {
      await patchEnquiryStatus(e._id, s);
      setE(d => ({ ...d, status: s }));
      setNotice('Enquiry status → ' + s + '.');
    } catch (er) { setNotice(gm(er)); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!e || busy) return;
    setBusy(true);
    try {
      await deleteEnquiry(e._id);
      setNotice('Enquiry deleted.'); setTimeout(() => nav('/owner/enquiries'), 1200);
    } catch (er) { setNotice(gm(er)); setBusy(false); }
  };

  return (
    <OwnerLayout title="ENQUIRY DETAIL" subtitle={e ? 'Viewing enquiry' : ''}>
      <div className="ft-detail-actions">
        <Link to="/owner/enquiries" className="ft-btn ft-btn-ghost">← BACK TO ENQUIRIES</Link>
        {e && (
          <>
            <select value={e.status} onChange={ev => setStatus(ev.target.value)} disabled={busy}
              style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}>
              {ENQ_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={del} disabled={busy}>DELETE</button>
          </>
        )}
      </div>
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}
      {err && !ld ? (
        <div className="ft-empty"><div className="ft-kicker">UNABLE TO LOAD ENQUIRY</div><p>{err}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setLd(true); setErr(''); }}>RETRY</button></div>
      ) : ld ? (
        <div className="ft-members-skeleton">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}</div>
      ) : e ? (
        <div className="ft-detail-grid">
          <section className="ft-detail-card ft-detail-wide">
            <div className="ft-kicker">ENQUIRY</div>
            <dl className="ft-detail-list">
              <div>
                <dt>STATUS</dt>
                <dd>
                  <SP status={e.status} />
                  <select value={e.status} onChange={ev => setStatus(ev.target.value)} disabled={busy}
                    style={{ marginLeft: 12, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}>
                    {ENQ_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </dd>
              </div>
              <div><dt>TYPE</dt><dd className="ft-mono">{e.enquiryType || '—'}</dd></div>
              <div><dt>PREFERRED CONTACT</dt><dd className="ft-mono">{e.preferredContact || '—'}</dd></div>
              <div><dt>SUBJECT</dt><dd style={{ color: 'var(--text-muted)' }}>{e.subject || '—'}</dd></div>
              <div><dt>MESSAGE</dt><dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 4 }}>{e.message || '—'}</dd></div>
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">CONTACT</div>
            <dl className="ft-detail-list">
              <div><dt>NAME</dt><dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase' }}>{e.name || '—'}</dd></div>
              <div><dt>EMAIL</dt><dd className="ft-mono">{e.email || '—'}</dd></div>
              <div><dt>PHONE</dt><dd className="ft-mono">{e.phone || '—'}</dd></div>
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">META</div>
            <dl className="ft-detail-list">
              <div><dt>CREATED</dt><dd className="ft-mono">{fmtD(e.createdAt)}</dd></div>
              <div><dt>UPDATED</dt><dd className="ft-mono">{fmtD(e.updatedAt)}</dd></div>
              <div><dt>ID</dt><dd className="ft-mono ft-id" style={{ wordBreak: 'break-all' }}>{e._id}</dd></div>
            </dl>
          </section>
        </div>
      ) : null}
    </OwnerLayout>
  );
}
