import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getProgram, updateProgram, patchProgramStatus, deleteProgram } from '../services/programService';

function fmtD(v){if(!v)return '—';const d=new Date(v);return isNaN(d.getTime())?'—':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
function gm(e){return e?.response?.data?.message||e?.response?.data?.error||e?.message||'Something went wrong';}

export default function OwnerProgramDetail(){
  const {id}=useParams();const nav=useNavigate();
  const [p,setP]=useState(null);const [ld,setLd]=useState(true);const [lE,setLE]=useState('');
  const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null);
  useEffect(()=>{let c=false;setLd(true);setLE('');getProgram(id).then(b=>{if(!c){if(!b?.data)setLE('Not found');else setP(b.data);}}).catch(e=>{if(!c)setLE(gm(e));}).finally(()=>{if(!c)setLd(false);});return()=>{c=true;};},[id]);
  const isActive = p?.isActive !== false;
  const doSt = (s) => {
    if (!p || busy) return;
    const targetActive = s === 'ACTIVE';
    setBusy(true);
    patchProgramStatus(p._id, targetActive)
      .then(() => {
        setP((x) => ({ ...x, isActive: targetActive }));
        setNotice('Program ' + (targetActive ? 'activated' : 'deactivated') + '.');
      })
      .catch((e) => setNotice(gm(e)))
      .finally(() => setBusy(false));
  };
  const doDel = () => {
    if (!p || busy) return;
    setBusy(true);
    deleteProgram(p._id)
      .then(() => {
        setNotice('Program deleted.');
        setTimeout(() => nav('/owner/programs'), 800);
      })
      .catch((e) => {
        setNotice(gm(e));
        setBusy(false);
      });
  };
  return (
    <OwnerLayout title="PROGRAM DETAIL" subtitle={p ? 'Viewing program' : ''}>
      <div className="ft-detail-actions">
        <Link to="/owner/programs" className="ft-btn ft-btn-ghost">← BACK TO PROGRAMS</Link>
        {p && (
          <>
            <button
              type="button"
              className="ft-btn ft-btn-ghost"
              onClick={() => doSt(isActive ? 'INACTIVE' : 'ACTIVE')}
              disabled={busy}
            >
              {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
            <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={doDel} disabled={busy}>
              DELETE
            </button>
          </>
        )}
      </div>
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}
      {ld ? (
        <div className="ft-members-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ft-skeleton-row" />
          ))}
        </div>
      ) : lE ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD PROGRAM</div>
          <p>{lE}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setLd(true); setLE(''); }}>
            RETRY
          </button>
        </div>
      ) : p ? (
        <div className="ft-detail-grid">
          <section className="ft-detail-card ft-detail-wide">
            <div className="ft-kicker">PROGRAM</div>
            <dl className="ft-detail-list">
              <div>
                <dt>STATUS</dt>
                <dd>
                  <span className={`ft-pill ${isActive ? 'ft-pill-active' : 'ft-pill-inactive'}`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <button
                    type="button"
                    className="ft-btn ft-btn-ghost"
                    style={{ marginLeft: 12, padding: '8px 16px', fontSize: '11px' }}
                    onClick={() => doSt(isActive ? 'INACTIVE' : 'ACTIVE')}
                    disabled={busy}
                  >
                    {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                </dd>
              </div>
              <div><dt>NAME</dt><dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '18px' }}>{p.name || '—'}</dd></div>
              <div><dt>CATEGORY</dt><dd className="ft-mono">{p.category || '—'}</dd></div>
              <div><dt>DIFFICULTY</dt><dd className="ft-mono">{p.difficulty || '—'}</dd></div>
              <div><dt>DURATION</dt><dd className="ft-mono">{p.duration || (p.durationMins != null ? p.durationMins + ' min' : '—')}</dd></div>
              <div><dt>FOCUS</dt><dd className="ft-mono">{p.focus || p.focusArea || '—'}</dd></div>
              <div><dt>DESCRIPTION</dt><dd style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', marginTop: 4 }}>{p.description || '—'}</dd></div>
            </dl>
          </section>
          <section className="ft-detail-card">
            <div className="ft-kicker">EQUIPMENT</div>
            <dl className="ft-detail-list">
              {p.equipment && p.equipment.length > 0 ? (
                p.equipment.map((e, i) => (
                  <div key={i}>
                    <dt>EQUIPMENT {i + 1}</dt>
                    <dd className="ft-mono">{typeof e === 'string' ? e : (e?.name || 'Equipment')}</dd>
                  </div>
                ))
              ) : (
                <div><dt>EQUIPMENT</dt><dd className="ft-mono" style={{ color: 'var(--text-faint)' }}>None assigned</dd></div>
              )}
            </dl>
          </section>
      <section className="ft-detail-card"><div className="ft-kicker">SESSIONS</div><dl className="ft-detail-list">
        {p.sessions&&p.sessions.length>0?(p.sessions.map((s,i)=><div key={i}><dt>SESSION {i+1}</dt><dd className="ft-mono" style={{fontSize:'13px'}}>{s?JSON.stringify(s):'—'}</dd></div>)):(<div><dt>SESSION</dt><dd className="ft-mono" style={{color:'var(--text-faint)'}}>—</dd></div>)}
      </dl></section>
      <section className="ft-detail-card"><div className="ft-kicker">META</div><dl className="ft-detail-list">
        <div><dt>FEATURED</dt><dd><span className={`ft-pill ${p.isFeatured?'ft-pill-active':'ft-pill-inactive'}`}>{p.isFeatured?'YES':'NO'}</span></dd></div>
        <div><dt>IMAGE</dt><dd className="ft-mono" style={{fontSize:'13px',wordBreak:'break-ALL'}}>{p.image||'—'}</dd></div>
        <div><dt>CREATED</dt><dd className="ft-mono">{fmtD(p.createdAt)}</dd></div>
        <div><dt>ID</dt><dd className="ft-mono ft-id" style={{wordBreak:'break-ALL'}}>{p._id}</dd></div>
      </dl></section>
    </div>):null}
  </OwnerLayout>);
}
