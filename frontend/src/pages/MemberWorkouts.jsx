import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemberLayout from '../components/MemberLayout.jsx';
import { Skeleton, ErrorBox, EmptyBox } from '../components/memberUi.jsx';
import { fmtD, gm } from '../components/memberFormat.js';
import { getMyWorkouts, getMyWorkoutById } from '../services/workoutService';
const LIMIT = 10;
const ST = { PLANNED: 'ft-pill-active', IN_PROGRESS: 'ft-pill-pending', COMPLETED: 'ft-pill-active', SKIPPED: 'ft-pill-inactive' };
export function MemberWorkouts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyWorkouts({ page, limit: LIMIT }); setRows(b?.data || []); setMeta(b?.meta || { page, pages: 0, total: 0 }); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [page]);
  return (
    <MemberLayout title="WORKOUTS" subtitle="WORKOUTS ASSIGNED TO YOU">
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : rows.length === 0 ? (
        <EmptyBox kicker="NO WORKOUTS ASSIGNED" text="No workouts assigned yet." />
      ) : (
        <>
          <div className="ft-members-table-wrap"><table className="ft-members-table">
            <thead><tr><th>TITLE</th><th>DATE</th><th>TRAINER</th><th>PROGRAM</th><th>STATUS</th><th>ACTION</th></tr></thead>
            <tbody>{rows.map((w) => (
              <tr key={w._id}><td style={{ color: 'var(--white)', fontWeight: 700 }}>{w.title || 'â€”'}</td><td className="ft-mono">{fmtD(w.date)}</td><td className="ft-mono">{w.trainer?.name || 'â€”'}</td><td className="ft-mono">{w.program?.name || 'â€”'}</td><td><span className={`ft-pill ${ST[w.status] || 'ft-pill-inactive'}`}>{w.status}</span></td><td><Link to={`/member/workouts/${w._id}`} className="ft-link">VIEW</Link></td></tr>
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
export function MemberWorkoutDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [w, setW] = useState(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const b = await getMyWorkoutById(id); setW(b?.data || null); if (!b?.data) setError('Workout not found'); }
    catch (e) { setError(gm(e)); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [id]);
  return (
    <MemberLayout title="WORKOUT DETAIL" subtitle="YOUR ASSIGNED WORKOUT">
      <div className="ft-detail-actions"><Link to="/member/workouts" className="ft-btn ft-btn-ghost">â† BACK TO WORKOUTS</Link></div>
      {loading ? <Skeleton /> : error ? <ErrorBox message={error} onRetry={load} /> : !w ? <EmptyBox kicker="WORKOUT NOT FOUND" text="This workout does not exist or is not assigned to you." /> : (
        <div className="ft-detail-grid">
          <section className="ft-detail-card">
            <div className="ft-kicker">WORKOUT</div>
            <div className="ft-title" style={{ fontSize: 26 }}>{w.title || 'â€”'}</div>
            <dl className="ft-detail-list">
              <div><dt>DATE</dt><dd className="ft-mono">{fmtD(w.date)}</dd></div>
              <div><dt>STATUS</dt><dd><span className={`ft-pill ${ST[w.status] || 'ft-pill-inactive'}`}>{w.status}</span></dd></div>
              <div><dt>TRAINER</dt><dd>{w.trainer?.name || 'â€”'}</dd></div>
              <div><dt>PROGRAM</dt><dd>{w.program?.name || 'â€”'}</dd></div>
              {w.notes ? <div><dt>NOTES</dt><dd>{w.notes}</dd></div> : null}
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">EXERCISES ({(w.exercises || []).length})</div>
            {(w.exercises || []).length === 0 ? <p style={{ color: 'var(--text-faint)' }}>No exercises recorded.</p> : (
              <div>{w.exercises.map((ex, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--border-soft)', padding: '12px 0' }}>
                  <div style={{ color: 'var(--white)', fontWeight: 700 }}>{i + 1}. {ex.name || 'Exercise'}</div>
                  <div className="ft-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {[ex.sets != null ? 'SETS ' + ex.sets : null, ex.reps != null ? 'REPS ' + ex.reps : null, ex.weight != null ? 'WEIGHT ' + ex.weight + ' kg' : null, ex.duration != null ? 'DURATION ' + ex.duration : null, ex.rest != null ? 'REST ' + ex.rest : null].filter(Boolean).join(' Â· ') || 'â€”'}
                  </div>
                  {ex.notes ? <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: 11 }}>{ex.notes}</div> : null}
                </div>
              ))}</div>
            )}
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
