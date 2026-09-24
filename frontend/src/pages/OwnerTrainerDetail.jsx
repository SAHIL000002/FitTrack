import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getTrainer, patchTrainerStatus, deleteTrainer } from '../services/trainerService';

function fmtD(v){if(!v)return '—';const d=new Date(v);return isNaN(d.getTime())?'—':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
function gm(e){return e?.response?.data?.message||e?.response?.data?.error||e?.message||'Something went wrong';}

export default function OwnerTrainerDetail(){
  const {id}=useParams();const nav=useNavigate();
  const [t,setT]=useState(null);const [ld,setLd]=useState(true);const [lE,setLE]=useState('');
  const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null);
  useEffect(()=>{let c=false;setLd(true);setLE('');getTrainer(id).then(b=>{if(!c){if(!b?.data)setLE('Not found');else setT(b.data);}}).catch(e=>{if(!c)setLE(gm(e));}).finally(()=>{if(!c)setLd(false);});return()=>{c=true;};},[id]);
  const isActive = t?.isActive !== false;
  const doSt = (s) => {
    if (!t || busy) return;
    const targetActive = s === 'ACTIVE';
    setBusy(true);
    patchTrainerStatus(t._id, targetActive)
      .then(() => {
        setT((p) => ({ ...p, isActive: targetActive, status: s }));
        setNotice('Trainer ' + (targetActive ? 'activated' : 'deactivated') + '.');
      })
      .catch((e) => setNotice(gm(e)))
      .finally(() => setBusy(false));
  };
  const doDel = () => {
    if (!t || busy) return;
    setBusy(true);
    deleteTrainer(t._id)
      .then(() => {
        setNotice('Trainer deleted.');
        setTimeout(() => nav('/owner/trainers'), 800);
      })
      .catch((e) => {
        setNotice(gm(e));
        setBusy(false);
      });
  };
  return (
    <OwnerLayout title="TRAINER DETAIL" subtitle={t ? 'Viewing trainer' : ''}>
      <div className="ft-detail-actions">
        <Link to="/owner/trainers" className="ft-btn ft-btn-ghost">← BACK TO TRAINERS</Link>
        {t && (
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
          <div className="ft-kicker">UNABLE TO LOAD TRAINER</div>
          <p>{lE}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setLd(true); setLE(''); }}>
            RETRY
          </button>
        </div>
      ) : t ? (
        <div className="ft-detail-grid">
          <section className="ft-detail-card ft-detail-wide">
            <div className="ft-kicker">TRAINER</div>
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
        <div><dt>NAME</dt><dd style={{color:'var(--white)',fontWeight:700,textTransform:'uppercase',fontSize:'18px'}}>{t.name||'—'}</dd></div>
        <div><dt>EMAIL</dt><dd className="ft-mono">{t.email||'—'}</dd></div>
        <div><dt>PHONE</dt><dd className="ft-mono">{t.phone||'—'}</dd></div>
        <div><dt>ROLE</dt><dd className="ft-mono">{t.role||'—'}</dd></div>
        <div><dt>SPECIALTY</dt><dd className="ft-mono">{t.specialty||'—'}</dd></div>
        <div><dt>EXPERIENCE</dt><dd className="ft-mono">{t.experience||'—'}</dd></div>
        <div><dt>BIO</dt><dd style={{color:'var(--text-muted)',whiteSpace:'pre-wrap',marginTop:4}}>{t.bio||'—'}</dd></div>
      </dl></section>
      <section className="ft-detail-card"><div className="ft-kicker">TRAINING STYLES</div><dl className="ft-detail-list">
        {t.trainingStyles&&t.trainingStyles.length>0?(t.trainingStyles.map((s,i)=><div key={i}><dt>STYLE {i+1}</dt><dd className="ft-mono">{s}</dd></div>)):<div><dt>STYLE</dt><dd className="ft-mono" style={{color:'var(--text-faint)'}}>—</dd></div>}
      </dl></section>
      <section className="ft-detail-card"><div className="ft-kicker">META</div><dl className="ft-detail-list">
        <div><dt>FEATURED</dt><dd><span className={`ft-pill ${t.isFeatured?'ft-pill-active':'ft-pill-inactive'}`}>{t.isFeatured?'YES':'NO'}</span></dd></div>
        <div><dt>HIRED</dt><dd className="ft-mono">{fmtD(t.hiredAt)}</dd></div>
        <div><dt>CREATED</dt><dd className="ft-mono">{fmtD(t.createdAt)}</dd></div>
        <div><dt>ID</dt><dd className="ft-mono ft-id" style={{wordBreak:'break-ALL'}}>{t._id}</dd></div>
      </dl></section>
    </div>):null}
  </OwnerLayout>);
}
