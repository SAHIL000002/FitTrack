import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { gm } from '../components/memberFormat.js';
import { getMyWorkouts } from '../services/workoutService';
export default function MemberTrainer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trainer, setTrainer] = useState(null);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const b = await getMyWorkouts({ limit: 100 });
      const list = b?.data || [];
      const t = list.map((w) => w.trainer).find((x) => x && x._id);
      setTrainer(t || null);
    } catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
   
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  return (
    <MemberLayout title="MY TRAINER" subtitle="YOUR ASSIGNED TRAINER">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : !trainer ? (
        <EmptyBox kicker="NO TRAINER ASSIGNED" text="No trainer is currently assigned to your workouts." action={<Link to="/member/enquiries" className="ft-btn ft-btn-ghost">CONTACT GYM</Link>} />
      ) : (
        <div className="ft-detail-grid">
          <section className="ft-detail-card">
            <div className="ft-kicker">TRAINER</div>
            <div className="ft-title" style={{ fontSize: 28 }}>{trainer.name || '—'}</div>
            <dl className="ft-detail-list">
              <div><dt>ROLE</dt><dd>{trainer.role || '—'}</dd></div>
              <div><dt>SPECIALTY</dt><dd>{trainer.specialty || '—'}</dd></div>
            </dl>
            {trainer.bio ? <p style={{ color: 'var(--text-muted)' }}>{trainer.bio}</p> : null}
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">PROFILE</div>
            <dl className="ft-detail-list">
              <div><dt>EXPERIENCE</dt><dd>{trainer.experience || '—'}</dd></div>
              <div><dt>CERTS</dt><dd>{(trainer.certifications || []).join(', ') || '—'}</dd></div>
              <div><dt>STYLES</dt><dd>{(trainer.trainingStyles || []).join(', ') || '—'}</dd></div>
            </dl>
            <p className="ft-form-note">Derived from your most recent assigned workout.</p>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
