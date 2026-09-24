import { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { gm } from '../components/memberFormat.js';
import { getPublicSettings } from '../services/settingsService';
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export default function MemberSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [s, setS] = useState(null);
  const [missing, setMissing] = useState(false);
  const load = async () => {
    setLoading(true); setError(''); setMissing(false);
    try { const b = await getPublicSettings(); setS(b?.data || null); if (!b?.data) setMissing(true); }
    catch (e) { if (e?.response?.status === 404) setMissing(true); else setError(gm(e)); }
    finally { setLoading(false); }
  };
   
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  const hours = s?.hours || {};
  const socials = s?.socialLinks || {};
  return (
    <MemberLayout title="GYM TIMINGS" subtitle="GYM INFORMATION AND HOURS">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : missing || !s ? (
        <EmptyBox kicker="GYM INFORMATION NOT AVAILABLE" text="Gym settings have not been published yet." />
      ) : (
        <div className="ft-detail-grid">
          <section className="ft-detail-card">
            <div className="ft-kicker">GYM</div>
            <div className="ft-title" style={{ fontSize: 26 }}>{s.gymName || 'â€”'}</div>
            {s.description ? <p style={{ color: 'var(--text-muted)' }}>{s.description}</p> : null}
            <dl className="ft-detail-list">
              <div><dt>ADDRESS</dt><dd>{s.address || 'â€”'}</dd></div>
              <div><dt>PHONE</dt><dd className="ft-mono">{s.phone || 'â€”'}</dd></div>
              <div><dt>EMAIL</dt><dd className="ft-mono">{s.email || 'â€”'}</dd></div>
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">WEEKLY TIMINGS</div>
            <dl className="ft-detail-list">
              {DAYS.map((d) => {
                const h = hours[d] || {};
                const v = h.isClosed ? 'CLOSED' : (h.open || h.close ? `${h.open || 'â€”'} â€“ ${h.close || 'â€”'}` : 'â€”');
                return <div key={d}><dt>{d.toUpperCase()}</dt><dd className="ft-mono">{v}</dd></div>;
              })}
            </dl>
            {Object.keys(socials).filter((k) => socials[k]).length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <div className="ft-kicker">SOCIAL</div>
                {Object.keys(socials).filter((k) => socials[k]).map((k) => (
                  <div key={k}><a className="ft-link" href={socials[k]} target="_blank" rel="noreferrer">{k.toUpperCase()}</a></div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
