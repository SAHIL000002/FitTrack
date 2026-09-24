import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { fmtD, gm } from '../components/memberFormat.js';
import { getMyProgressById } from '../services/progressService';
export function MemberProgressDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [r, setR] = useState(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyProgressById(id); setR(b?.data || null); if (!b?.data) setError('Not found'); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [id]);
  const m = r?.measurements || {};
  return (
    <MemberLayout title="PROGRESS DETAIL" subtitle="YOUR MEASUREMENT RECORD">
      <div className="ft-detail-actions"><Link to="/member/progress" className="ft-btn ft-btn-ghost">â† BACK TO PROGRESS</Link></div>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : !r ? <EmptyBox kicker="NOT FOUND" text="Record not found." /> : (
        <div className="ft-detail-grid">
          <section className="ft-detail-card">
            <div className="ft-kicker">RECORD</div>
            <dl className="ft-detail-list">
              <div><dt>DATE</dt><dd className="ft-mono">{fmtD(r.date)}</dd></div>
              <div><dt>WEIGHT</dt><dd className="ft-mono">{r.weight ?? 'â€”'} kg</dd></div>
              <div><dt>BODY FAT</dt><dd className="ft-mono">{r.bodyFat ?? 'â€”'} %</dd></div>
              {r.notes ? <div><dt>NOTES</dt><dd>{r.notes}</dd></div> : null}
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">MEASUREMENTS (CM)</div>
            <dl className="ft-detail-list">
              <div><dt>CHEST</dt><dd className="ft-mono">{m.chest ?? 'â€”'}</dd></div>
              <div><dt>WAIST</dt><dd className="ft-mono">{m.waist ?? 'â€”'}</dd></div>
              <div><dt>HIPS</dt><dd className="ft-mono">{m.hips ?? 'â€”'}</dd></div>
              <div><dt>ARMS</dt><dd className="ft-mono">{m.arms ?? 'â€”'}</dd></div>
              <div><dt>THIGHS</dt><dd className="ft-mono">{m.thighs ?? 'â€”'}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}