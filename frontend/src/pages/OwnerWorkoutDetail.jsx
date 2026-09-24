import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getWorkout, patchWorkoutStatus, deleteWorkout } from '../services/workoutService';

function fmtDate(v){if(!v)return '—';const d=new Date(v);if(isNaN(d.getTime()))return '—';return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
function fmtDT(v){if(!v)return '—';const d=new Date(v);if(isNaN(d.getTime()))return '—';return d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
function gm(e){return e?.response?.data?.message||e?.response?.data?.error||e?.message||'Something went wrong';}
const WORKOUT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];
const SM = {
  PLANNED: 'ft-pill-active',
  IN_PROGRESS: 'ft-pill-pending',
  COMPLETED: 'ft-pill-active',
  SKIPPED: 'ft-pill-inactive',
};
function SP({ status }) { return <span className={"ft-pill " + (SM[status] || 'ft-pill-inactive')}>{status || '—'}</span>; }

export default function OwnerWorkoutDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const [w, setW] = useState(null);
  const [ld, setLd] = useState(true);
  const [le, setLe] = useState('');
  const [bu, setBu] = useState(false);
  const [no, setNo] = useState(null);

  useEffect(() => {
    let cn = false;
    const l = async () => {
      setLd(true); setLe('');
      try {
        const b = await getWorkout(id);
        if (!cn) setW(b?.data || null);
        if (!cn && !b?.data) setLe('Workout not found');
      } catch (e) {
        if (!cn) setLe(gm(e));
      } finally {
        if (!cn) setLd(false);
      }
    };
    l();
    return () => { cn = true; };
  }, [id]);

  const hs = async (s) => {
    if (!w || bu) return;
    setBu(true);
    try {
      await patchWorkoutStatus(w._id, s);
      setW((d) => ({ ...d, status: s }));
      setNo('Status → ' + s + '.');
    } catch (e) {
      setNo(gm(e));
    } finally {
      setBu(false);
    }
  };

  const hd = async () => {
    if (!w || bu) return;
    setBu(true);
    try {
      await deleteWorkout(w._id);
      setNo('Workout deleted.');
      setTimeout(() => nav('/owner/workouts'), 1000);
    } catch (e) {
      setNo(gm(e));
      setBu(false);
    }
  };

  const nextS = (s) => (s === 'PLANNED' ? 'IN_PROGRESS' : s === 'IN_PROGRESS' ? 'COMPLETED' : s === 'COMPLETED' ? 'PLANNED' : 'PLANNED');

  return (
    <OwnerLayout title="WORKOUT DETAIL" subtitle={w ? (w.title || 'Workout Session') : 'Viewing workout'}>
      <div className="ft-detail-actions">
        <Link to="/owner/workouts" className="ft-btn ft-btn-ghost">← BACK TO WORKOUTS</Link>
        {w && (
          <>
            <select
              value={w.status}
              onChange={(e) => hs(e.target.value)}
              disabled={bu}
              style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
            >
              {WORKOUT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={hd} disabled={bu}>DELETE</button>
          </>
        )}
      </div>
      {no && <div className="ft-banner ft-banner-ok">{no}</div>}
      {ld ? (
        <div className="ft-members-skeleton">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}
        </div>
      ) : le ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD WORKOUT</div>
          <p>{le}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setLd(true); setLe(''); }}>RETRY</button>
        </div>
      ) : w ? (
        <div className="ft-detail-grid">
          <section className="ft-detail-card ft-detail-wide">
            <div className="ft-kicker">WORKOUT</div>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--white)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {w.title || 'Untitled Workout'}
              </h2>
              <SP status={w.status} />
            </div>
            <dl className="ft-detail-list">
              <div>
                <dt>STATUS</dt>
                <dd>
                  <SP status={w.status} />
                  <button
                    type="button"
                    className="ft-btn ft-btn-ghost"
                    style={{ marginLeft: 12, padding: '8px 14px', fontSize: '11px' }}
                    onClick={() => hs(nextS(w.status))}
                    disabled={bu}
                  >
                    {w.status === 'PLANNED' ? 'START WORKOUT' : w.status === 'IN_PROGRESS' ? 'COMPLETE' : 'SET PLANNED'}
                  </button>
                </dd>
              </div>
              <div><dt>TITLE</dt><dd style={{ fontWeight: 700, color: 'var(--white)', textTransform: 'uppercase', fontSize: '16px' }}>{w.title || '—'}</dd></div>
              <div>
                <dt>MEMBER</dt>
                <dd>
                  <Link to={`/owner/members/${w.user?._id || w.member?._id || ''}`} className="ft-member-name">
                    {w.user?.name || w.member?.name || '—'}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>TRAINER</dt>
                <dd>{w.trainer ? <Link to={`/owner/trainers/${w.trainer._id}`} className="ft-member-name">{w.trainer.name || '—'}</Link> : '—'}</dd>
              </div>
              <div>
                <dt>PROGRAM</dt>
                <dd>{w.program ? <Link to={`/owner/programs/${w.program._id}`} className="ft-member-name">{w.program.name || '—'}</Link> : '—'}</dd>
              </div>
              <div><dt>DATE</dt><dd className="ft-mono">{fmtDate(w.date)}</dd></div>
              {w.notes && <div><dt>NOTES</dt><dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 4 }}>{w.notes}</dd></div>}
          </dl>
        </section>
        <section className="ft-detail-card">
          <div className="ft-kicker">EXERCISES ({w.exercises?.length||0})</div>
          {(!w.exercises||w.exercises.length===0)?(<p style={{color:'var(--text-faint)',fontFamily:'var(--font-mono)',fontSize:'13px',margin:'0 0 16px'}}>No exercises recorded.</p>):
          (<div style={{margin:'0 -12px'}}>
            {w.exercises.map((ex,idx)=>(
              <div key={ex._id||idx} style={{borderBottom:'1px solid var(--border-soft)',padding:'14px 12px',background:idx%2===0?'transparent':'rgba(255,255,255,0.02)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{color:'var(--white)',fontWeight:700,textTransform:'uppercase',fontSize:'13px',letterSpacing:'0.04em'}}>{idx+1}. {ex.name||ex.title||'Exercise'}</span>
                  {ex.status&&<span className="ft-pill" style={{fontSize:'10px'}}>{ex.status}</span>}
                </div>
                {ex.description&&<div style={{color:'var(--text-muted)',fontSize:'13px',marginBottom:8,fontStyle:'italic'}}>{ex.description}</div>}
                <div style={{display:'grid',gridTemplateColumns:'auto auto',gap:'2px 16px',fontSize:'12px',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>
                  {ex.sets!=null&&<span>SETS {ex.sets}</span>}
                  {ex.reps!=null&&<span>REPS {ex.reps}</span>}
                  {ex.weight!=null&&<span>WEIGHT {ex.weight} kg</span>}
                  {ex.duration!=null&&<span>DURATION {fmtDate(ex.duration)}</span>}
                  {ex.distance!=null&&<span>DISTANCE {ex.distance}</span>}
                  {ex.series!=null&&<span>SERIES {ex.series}</span>}
                </div>
                {ex.notes&&<div style={{color:'var(--text-faint)',fontSize:'11px',marginTop:6,fontStyle:'italic',fontFamily:'var(--font-mono)'}}>{ex.notes}</div>}
              </div>
            ))}
          </div>)}
        </section>
        <section className="ft-detail-card">
          <div className="ft-kicker">META</div>
          <dl className="ft-detail-list">
            <div><dt>CREATED</dt><dd className="ft-mono">{fmtDT(w.createdAt)}</dd></div>
            <div><dt>UPDATED</dt><dd className="ft-mono">{fmtDT(w.updatedAt)}</dd></div>
            <div><dt>ID</dt><dd className="ft-mono ft-id" style={{wordBreak:'break-all'}}>{w._id}</dd></div>
          </dl>
        </section>
      </div>):null}
  </OwnerLayout>);
}
