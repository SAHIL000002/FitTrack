import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listPrograms,
  createProgram,
  updateProgram,
  patchProgramStatus,
  deleteProgram,
  getProgram,
} from '../services/programService';
import { listEquipment } from '../services/equipmentService';

const LIMIT = 10;

function fmtD(v){if(!v)return '—';const d=new Date(v);return isNaN(d.getTime())?'—':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
function gm(e){return e?.response?.data?.message||e?.response?.data?.error||e?.message||'Something went wrong';}

const CATS = ['STRENGTH','CARDIO','FLEXIBILITY','YOGA','HIIT','CROSSFIT','BOXING','FUNCTIONAL','RECOVERY','OTHER'];
const DIFFS = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const FOCUSES = ['FAT_LOSS','MUSCLE_BUILD','ENDURANCE','STRENGTH','FLEXIBILITY','MOBILITY','RECOVERY','GENERAL_FITNESS'];

const CAT_LABEL={STRENGTH:'STRENGTH',CARDIO:'CARDIO',FLEXIBILITY:'FLEXIBILITY',YOGA:'YOGA',HIIT:'HIIT',CROSSFIT:'CROSSFIT',BOXING:'BOXING',FUNCTIONAL:'FUNCTIONAL',RECOVERY:'RECOVERY',OTHER:'OTHER'};
const DIFF_LABEL={BEGINNER:'BEGINNER',INTERMEDIATE:'INTERMEDIATE',ADVANCED:'ADVANCED'};

function Confirm({title,message,label,warn,onCancel,onConfirm,busy}){
  return (<div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
    <div className="ft-modal ft-modal-sm">
      <div className="ft-modal-header"><h3>{title}</h3><button type="button" className="ft-icon-btn" onClick={onCancel}>✕</button></div>
      <p style={{color:'var(--text-muted)',margin:'0 0 20px'}}>{message}</p>
      <div className="ft-modal-actions">
        <button type="button" className="ft-btn ft-btn-ghost" onClick={onCancel} disabled={busy}>CANCEL</button>
        <button type="button" className={"ft-btn "+(warn?'ft-btn-danger':'ft-btn-primary')} onClick={onConfirm} disabled={busy}>{busy?'PROCESSING…':label}</button>
      </div>
    </div>
  </div>);
}

function ProgramFormModal({open,mode,initial,equip,busy,onClose,onSubmit}){
  const [form,setForm]=useState({name:'',description:'',category:'STRENGTH',difficulty:'BEGINNER',durationMins:'',focus:'GENERAL_FITNESS',equipment:[],isFeatured:false,isActive:true,image:''});
  const [err,setErr]=useState('');
  useEffect(()=>{if(!open)return;setErr('');setForm({name:initial?.name||'',description:initial?.description||'',category:initial?.category||'STRENGTH',difficulty:initial?.difficulty||'BEGINNER',durationMins:initial?.durationMins!=null?String(initial.durationMins):'',focus:initial?.focus||initial?.focusArea||'GENERAL_FITNESS',equipment:initial?.equipment||[],isFeatured:initial?.isFeatured??false,isActive:initial?.isActive!=null?initial.isActive:true,image:initial?.image||''});},[open,initial]);
  if(!open)return null;
  const set=(k)=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const setBool=(k)=>e=>setForm(f=>({...f,[k]:e.target.checked}));
  const toggleEq=eid=>setForm(f=>{const arr=f.equipment.includes(eid)?[...f.equipment].filter(x=>x!==eid):[...f.equipment,eid];return {...f,equipment:arr};});
  const submit=e=>{e.preventDefault();setErr('');if(!form.name.trim())return setErr('Name is required');onSubmit(form);};
  return (<div className="ft-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}>
    <div className="ft-modal" role="dialog" aria-modal="true">
      <div className="ft-modal-header"><h3>{mode==='create'?'NEW PROGRAM':'EDIT PROGRAM'}</h3><button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy}>✕</button></div>
      {err&&<div className="ft-alert ft-alert-error">{err}</div>}
      <form onSubmit={submit} className="ft-form">
        <div className="ft-field"><span>Name *</span><input type="text" value={form.name} onChange={set('name')} placeholder="Program name" /></div>
        <div className="ft-field"><span>Description</span><textarea rows={4} value={form.description} onChange={set('description')} placeholder="Program description…" /></div>
        <div className="ft-form-grid">
          <div className="ft-field"><span>Category</span><select value={form.category} onChange={set('category')}>{CATS.map(c=><option key={c} value={c}>{CAT_LABEL[c]}</option>)}</select></div>
          <div className="ft-field"><span>Difficulty</span><select value={form.difficulty} onChange={set('difficulty')}>{DIFFS.map(d=><option key={d} value={d}>{DIFF_LABEL[d]}</option>)}</select></div>
        </div>
        <div className="ft-form-grid">
          <div className="ft-field"><span>Duration (min)</span><input type="number" min="1" value={form.durationMins} onChange={set('durationMins')} /></div>
          <div className="ft-field"><span>Focus</span><select value={form.focus} onChange={set('focus')}>{FOCUSES.map(f=><option key={f} value={f}>{f.replace(/_/g,' ')}</option>)}</select></div>
        </div>
        <div className="ft-field"><span>Equipment</span><div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'6px',alignItems:'center'}}>{equip?.map(e=>(<button key={e._id} type="button" onClick={()=>toggleEq(e._id)} style={{
          background:form.equipment.includes(e._id)?'var(--lime)':'var(--bg-deep)',
          border:'1px solid',borderColor:form.equipment.includes(e._id)?'var(--lime)':'var(--border)',
          color:form.equipment.includes(e._id)?'#0c0f05':'var(--text-muted)',
          padding:'6px 12px',fontFamily:'var(--font-mono)',fontSize:'11px',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.04em'
        }}>{e.name}</button>))}</div>
          <span className="ft-field-hint">Select equipment used in this program</span></div>
        <div className="ft-check-row">
          <label className="ft-check"><input type="checkbox" checked={form.isFeatured} onChange={setBool('isFeatured')} /><span>Featured</span></label>
          <label className="ft-check"><input type="checkbox" checked={form.isActive} onChange={setBool('isActive')} /><span>Active</span></label>
        </div>
        <div className="ft-field"><span>Image URL</span><input type="text" value={form.image} onChange={set('image')} placeholder="Optional image URL" /></div>
        <div className="ft-modal-actions"><button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>CANCEL</button>
          <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>{busy?'SAVING…':mode==='create'?'CREATE PROGRAM':'SAVE CHANGES'}</button></div>
      </form>
    </div>
  </div>);
}

export default function OwnerPrograms(){
  const nav=useNavigate();const {id}=useParams();
  const [page,setPage]=useState(1);const [search,setSearch]=useState('');
  const [catF,setCatF]=useState('');const [diffF,setDiffF]=useState('');const [featF,setFeatF]=useState('');
  const [list,setList]=useState([]);const [meta,setMeta]=useState({page:1,pages:0,total:0});
  const [ld,setLd]=useState(true);const [lE,setLE]=useState('');const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null);
  const [equip,setEquip]=useState([]);
  const [detail,setDetail]=useState(null);const [dld,setDld]=useState(false);
  const [modal,setModal]=useState(null);const [confirm,setConfirm]=useState(null);
  const loadList = useCallback(async () => {
    setLd(true);
    setLE('');
    try {
      const b = await listPrograms({
        page,
        limit: LIMIT,
        category: catF || undefined,
        difficulty: diffF || undefined,
        featured: featF ? featF === 'true' : undefined,
      });
      setList(b?.data || []);
      setMeta(b?.meta || { page, pages: 0, total: 0 });
    } catch (e) {
      setLE(gm(e));
    } finally {
      setLd(false);
    }
  }, [page, catF, diffF, featF]);

  const loadEquip = useCallback(async () => {
    try {
      const b = await listEquipment({ limit: 200 });
      setEquip(b?.data || []);
    } catch {}
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setDld(true);
    setLE('');
    try {
      const b = await getProgram(id);
      setDetail(b?.data || null);
      if (!b?.data) setLE('Program not found');
    } catch (e) {
      setLE(gm(e));
    } finally {
      setDld(false);
    }
  }, [id]);

  useEffect(() => {
    loadEquip();
    if (id) {
      loadDetail();
    } else {
      loadList();
    }
  }, [id, loadList, loadDetail, loadEquip]);

  const refresh = () => {
    setPage(1);
    loadList();
  };
  const closeM = () => setModal(null);
  const closeC = () => setConfirm(null);

  const doCreate = async (f) => {
    setBusy(true);
    try {
      await createProgram({
        name: f.name.trim(),
        description: f.description?.trim() || undefined,
        category: f.category,
        difficulty: f.difficulty,
        duration: f.durationMins ? `${f.durationMins} min` : '45 min',
        focus: f.focus,
        equipment: f.equipment?.length > 0 ? f.equipment : undefined,
        featured: Boolean(f.isFeatured),
        image: f.image?.trim() || undefined,
      });
      setNotice('Program created successfully.');
      refresh();
      closeM();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };

  const doUpdate = async (f) => {
    const targetId = id || f._id;
    if (!targetId) return;
    setBusy(true);
    try {
      await updateProgram(targetId, {
        name: f.name.trim(),
        description: f.description?.trim() || undefined,
        category: f.category,
        difficulty: f.difficulty,
        duration: f.durationMins ? `${f.durationMins} min` : '45 min',
        focus: f.focus,
        equipment: f.equipment?.length > 0 ? f.equipment : undefined,
        featured: Boolean(f.isFeatured),
        image: f.image?.trim() || undefined,
      });
      setNotice('Program updated.');
      if (id) loadDetail();
      refresh();
      closeM();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };

  const doStatus = async (p, s) => {
    setBusy(true);
    try {
      const active = s === 'ACTIVE' || s === true;
      await patchProgramStatus(p._id, active);
      setNotice(`Program ${active ? 'activated' : 'deactivated'}.`);
      if (detail?._id === p._id) setDetail((x) => ({ ...x, isActive: active }));
      refresh();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };
  const doDelete=async(p)=>{setBusy(true);try{await deleteProgram(p._id);setNotice('Program deleted.');if(detail?._id===p._id)setDetail(null);nav('/owner/programs');refresh();}catch(e){setNotice(gm(e));}finally{setBusy(false);}};
  const openC=()=>setModal({mode:'create',initial:null});
  const openE=(p)=>setModal({mode:'edit',initial:p});
  if(id)return(<OwnerLayout title="PROGRAM DETAIL" subtitle={detail?'Viewing program':''}>
    <div className="ft-detail-actions"><Link to="/owner/programs" className="ft-btn ft-btn-ghost">←BACK TO PROGRAMS</Link>
    {detail&&(<><button type="button" className="ft-btn ft-btn-ghost" onClick={()=>openE(detail)}>EDIT</button>
      <button type="button" className="ft-btn ft-btn-ghost" onClick={()=>doStatus(detail,detail.isActive?'INACTIVE':'ACTIVE')} disabled={busy}>{detail.isActive?'DEACTIVATE':'ACTIVATE'}</button>
      <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={()=>setConfirm({kind:'delete',p:detail})}>DELETE</button></>)}
    </div>
    {notice&&<div className="ft-banner ft-banner-ok">{notice}</div>}
    {dld?(<div className="ft-members-skeleton">{Array.from({length:6}).map((_,i)=><div key={i} className="ft-skeleton-row"/>)}</div>):lE?(<div className="ft-empty"><div className="ft-kicker">UNABLE TO LOAD PROGRAM</div><p>{lE}</p><button type="button" className="ft-btn ft-btn-ghost" onClick={loadDetail}>RETRY</button></div>):detail?(<div className="ft-detail-grid">
      <section className="ft-detail-card ft-detail-wide"><div className="ft-kicker">PROGRAM</div><dl className="ft-detail-list">
        <div><dt>STATUS</dt><dd><span className={`ft-pill ${detail.isActive?'ft-pill-active':'ft-pill-inactive'}`}>{detail.isActive?'ACTIVE':'INACTIVE'}</span></dd></div>
        <div><dt>NAME</dt><dd style={{color:'var(--white)',fontWeight:700,textTransform:'uppercase',fontSize:'18px'}}>{detail.name||'—'}</dd></div>
        <div><dt>CATEGORY</dt><dd className="ft-mono">{detail.category||'—'}</dd></div>
        <div><dt>DIFFICULTY</dt><dd className="ft-mono">{detail.difficulty||'—'}</dd></div>
        <div><dt>DURATION</dt><dd className="ft-mono">{detail.durationMins!=null?detail.durationMins+' min':(detail.duration||'—')}</dd></div>
        <div><dt>FOCUS</dt><dd className="ft-mono">{(detail.focus||detail.focusArea||'—').replace(/_/g,' ')}</dd></div>
        <div><dt>DESCRIPTION</dt><dd style={{color:'var(--text-muted)',whiteSpace:'pre-wrap',marginTop:4}}>{detail.description||'—'}</dd></div>
      </dl></section>
      <section className="ft-detail-card"><div className="ft-kicker">EQUIPMENT</div><dl className="ft-detail-list">
        {detail.equipment&&detail.equipment.length>0?(detail.equipment.map((e,i)=><div key={i}><dt>ITEM {i+1}</dt><dd className="ft-mono">{(typeof e==='string')?e:(e?e.name||JSON.stringify(e):'—')}</dd></div>)):(<div><dt>ITEM</dt><dd className="ft-mono" style={{color:'var(--text-faint)'}}>—</dd></div>)}
      </dl></section>
      <section className="ft-detail-card"><div className="ft-kicker">META</div><dl className="ft-detail-list">
        <div><dt>FEATURED</dt><dd><span className={`ft-pill ${detail.isFeatured?'ft-pill-active':'ft-pill-inactive'}`}>{detail.isFeatured?'YES':'NO'}</span></dd></div>
        <div><dt>IMAGE</dt><dd className="ft-mono" style={{fontSize:'13px',wordBreak:'break-ALL'}}>{detail.image||'—'}</dd></div>
        <div><dt>CREATED</dt><dd className="ft-mono">{fmtD(detail.createdAt)}</dd></div>
        <div><dt>ID</dt><dd className="ft-mono ft-id" style={{wordBreak:'break-ALL'}}>{detail._id}</dd></div>
      </dl></section>
    </div>):null}
    {modal&&<ProgramFormModal open={!!modal} mode={modal.mode} initial={modal.initial} equip={equip} busy={busy} onClose={closeM} onSubmit={modal.mode==='create'?doCreate:doUpdate} />}
    {confirm&&<Confirm title="DELETE PROGRAM" message={`Delete program "${confirm.p.name}"? It will be soft-deleted.`} label="DELETE" warn={true} onCancel={closeC} onConfirm={()=>doDelete(confirm.p)} busy={busy} />}
  </OwnerLayout>);
  return(<OwnerLayout title="PROGRAM MANAGEMENT" subtitle="Create and manage workout programs">
    {notice&&<div className="ft-banner ft-banner-ok">{notice}</div>}
    {dld||ld?(<div className="ft-members-skeleton">{Array.from({length:8}).map((_,i)=><div key={i} className="ft-skeleton-row"/>)}</div>):lE?(<div className="ft-empty"><div className="ft-kicker">UNABLE TO LOAD PROGRAMS</div><p>{lE}</p><button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button></div>):list.length===0?(<div className="ft-empty"><div className="ft-kicker">NO PROGRAMS FOUND</div><p>No programs match the current filters.</p><button type="button" className="ft-btn ft-btn-ghost" onClick={refresh}>CLEAR FILTERS</button></div>):
    (<>
      <div className="ft-payments-metrics">
        <div className="ft-stat-card"><div className="ft-stat-value">{meta.total}</div><div className="ft-stat-label">TOTAL PROGRAMS</div></div>
        <div className="ft-stat-card"><div className="ft-stat-value">{list.filter(p=>p.isActive).length}</div><div className="ft-stat-label">ACTIVE</div></div>
        <div className="ft-stat-card"><div className="ft-stat-value">{list.filter(p=>!p.isActive).length}</div><div className="ft-stat-label">INACTIVE</div></div>
        <div className="ft-stat-card"><div className="ft-stat-value">{list.filter(p=>p.isFeatured).length}</div><div className="ft-stat-label">FEATURED</div></div>
      </div>
      <div className="ft-members-toolbar">
        <div className="ft-search"><input type="text" placeholder="Search programs…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/><button type="button" className="ft-btn ft-btn-ghost ft-search-btn" onClick={()=>{setSearch('');setPage(1);}}>CLEAR</button></div>
        <div className="ft-members-filters">
          <select value={catF} onChange={e=>{setCatF(e.target.value);setPage(1);}}><option value="">ALL CATEGORIES</option>{CATS.map(c=><option key={c} value={c}>{CAT_LABEL[c]}</option>)}</select>
          <select value={diffF} onChange={e=>{setDiffF(e.target.value);setPage(1);}}><option value="">ALL LEVELS</option>{DIFFS.map(d=><option key={d} value={d}>{DIFF_LABEL[d]}</option>)}</select>
          <select value={featF} onChange={e=>{setFeatF(e.target.value);setPage(1);}}><option value="">ALL</option><option value="true">FEATURED</option><option value="false">NOT FEATURED</option></select>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={()=>{setCatF('');setDiffF('');setFeatF('');setSearch('');setPage(1);}}>CLEAR FILTERS</button>
        </div>
        <button type="button" className="ft-btn ft-btn-primary" onClick={openC}>+ NEW PROGRAM</button>
      </div>
      <div className="ft-members-table-wrap"><table className="ft-members-table"><thead><tr>
        <th>PROGRAM</th><th>CATEGORY</th><th>DIFFICULTY</th><th>DURATION</th><th>FOCUS</th><th>FEATURED</th><th>STATUS</th><th>CREATED</th><th>ACTIONS</th>
      </tr></thead><tbody>
      {list.map(p=>(<tr key={p._id}>
        <td><div style={{color:'var(--white)',fontWeight:700,textTransform:'uppercase',fontSize:'14px'}}>{p.name||'—'}</div>
          {p.description&&<div className="ft-mono" style={{color:'var(--text-faint)',fontSize:'11px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{p.description}</div>}</td>
        <td><span className="ft-pill" style={{borderColor:'var(--text-faint)',color:'var(--text-muted)'}}>{p.category||'—'}</span></td>
        <td><span className="ft-pill" style={{borderColor:'var(--text-faint)',color:'var(--text-muted)'}}>{p.difficulty||'—'}</span></td>
        <td className="ft-mono">{p.durationMins!=null?p.durationMins+' min':(p.duration||'—')}</td>
        <td className="ft-mono" style={{color:'var(--text-muted)'}}>{(p.focus||p.focusArea||'—').replace(/_/g,' ')}</td>
        <td><span className={`ft-pill ${p.isFeatured?'ft-pill-active':'ft-pill-inactive'}`} style={{fontSize:'10px'}}>{p.isFeatured?'★FEAT':'—'}</span></td>
        <td><span className={`ft-pill ${p.isActive?'ft-pill-active':'ft-pill-inactive'}`}>{p.isActive?'ACTIVE':'INACTIVE'}</span></td>
        <td className="ft-mono" style={{color:'var(--text-faint)'}}>{fmtD(p.createdAt)}</td>
        <td><div className="ft-row-actions"><Link to={`/owner/programs/${p._id}`} className="ft-link">VIEW</Link>
          <button type="button" className="ft-link" onClick={()=>openE(p)}>EDIT</button>
          <button type="button" className="ft-link" onClick={()=>doStatus(p,p.isActive?'INACTIVE':'ACTIVE')} disabled={busy}>{p.isActive?'DEACTIVATE':'ACTIVATE'}</button>
          <button type="button" className="ft-link ft-link-danger" onClick={()=>setConfirm({kind:'delete',p})}>DELETE</button></div></td>
      </tr>))}
      </tbody></table></div>
      <div className="ft-pagination"><span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages||0} · TOTAL {meta.total}</span>
        <div className="ft-pagination-btns"><button type="button" className="ft-btn ft-btn-ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>PREVIOUS</button>
        <button type="button" className="ft-btn ft-btn-ghost" onClick={()=>setPage(p=>p+1)} disabled={page>=meta.pages}>NEXT</button></div></div>
    </>)}
    {modal&&<ProgramFormModal open={!!modal} mode={modal.mode} initial={modal.initial} equip={equip} busy={busy} onClose={closeM} onSubmit={modal.mode==='create'?doCreate:doUpdate} />}
    {confirm&&<Confirm title="DELETE PROGRAM" message={`Delete program "${confirm.p.name}"? It will be soft-deleted.`} label="DELETE" warn={true} onCancel={closeC} onConfirm={()=>doDelete(confirm.p)} busy={busy} />}
  </OwnerLayout>);
}
