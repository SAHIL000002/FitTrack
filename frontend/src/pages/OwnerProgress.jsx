import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { listProgress, getProgress, createProgress, updateProgress, deleteProgress } from '../services/progressService';
import { listMembers } from '../services/memberService';

const LIMIT = 10;

function fmtD(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }

function gm(e) { return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong'; }

function StatCard({ l, v }) {
  return <div className='ft-stat-card'><div className='ft-stat-value'>{v}</div><div className='ft-stat-label'>{l}</div></div>;
}

function ConfirmDialog({ title, message, label, warn, onCancel, onConfirm, busy }) {
  return (
    <div className='ft-modal-overlay' role='alertdialog' aria-modal='true'>
      <div className='ft-modal ft-modal-sm'>
        <div className='ft-modal-header'>
          <h3>{title}</h3>
          <button type='button' className='ft-icon-btn' onClick={onCancel}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{message}</p>
        <div className='ft-modal-actions'>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={onCancel} disabled={busy}>CANCEL</button>
          <button type='button' className={'ft-btn ' + (warn ? 'ft-btn-danger' : 'ft-btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy ? 'PROCESSING…' : label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerProgress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [memberF, setMemberF] = useState('');
  const [dateF, setDateF] = useState('');
  const [fromD, setFromD] = useState('');
  const [toD, setToD] = useState('');

  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [lE, setLE] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [members, setMembers] = useState([]);
  const [detail, setDetail] = useState(null);
  const [dLoading, setDLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const params = {
    page, limit: LIMIT,
    user: memberF || undefined,
    date: dateF || undefined,
    from: fromD || undefined,
    to: toD || undefined,
  };

  const loadList = async () => {
    setLoading(true); setLE('');
    try {
      const b = await listProgress(params);
      setRecords(b?.data || []);
      setMeta(b?.meta || { page, pages: 0, total: 0 });
    } catch (e) { setLE(gm(e)); }
    finally { setLoading(false); }
  };

  const loadDetail = async () => {
    setDLoading(true); setLE('');
    try {
      const b = await getProgress(id);
      setDetail(b?.data || null);
      if (!b?.data) setLE('Not found');
    } catch (e) { setLE(gm(e)); }
    finally { setDLoading(false); }
  };

  const loadMembers = async () => {
    try {
      const b = await listMembers({ status: 'active', limit: 200 });
      setMembers(b?.data || []);
    } catch {}
  };

  useEffect(() => {
    loadMembers();
    if (id) { loadDetail(); }
    else { loadList(); }
  }, []);

  const refresh = () => { setPage(1); loadList(); };
  const closeM = () => setModal(null);
  const closeC = () => setConfirm(null);

  const openCreate = () => setModal({ mode: 'create', initial: null });
  const openEdit = (r) => setModal({ mode: 'edit', initial: r });

  const doCreate = async (f) => {
    setBusy(true);
    try {
      await createProgress({
        user: f.member,
        date: f.date || undefined,
        weight: f.weight ? Number(f.weight) : undefined,
        bodyFat: f.bodyFat ? Number(f.bodyFat) : undefined,
        chest: f.chest ? Number(f.chest) : undefined,
        waist: f.waist ? Number(f.waist) : undefined,
        hips: f.hips ? Number(f.hips) : undefined,
        arms: f.arms ? Number(f.arms) : undefined,
        thighs: f.thighs ? Number(f.thighs) : undefined,
        notes: f.notes || undefined,
      });
      setNotice('Progress record added.');
      refresh();
      closeM();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  const doUpdate = async (f) => {
    if (!id) return;
    setBusy(true);
    try {
      await updateProgress(id, {
        date: f.date || undefined,
        weight: f.weight != null ? Number(f.weight) : undefined,
        bodyFat: f.bodyFat != null ? Number(f.bodyFat) : undefined,
        chest: f.chest != null ? Number(f.chest) : undefined,
        waist: f.waist != null ? Number(f.waist) : undefined,
        hips: f.hips != null ? Number(f.hips) : undefined,
        arms: f.arms != null ? Number(f.arms) : undefined,
        thighs: f.thighs != null ? Number(f.thighs) : undefined,
        notes: f.notes || undefined,
      });
      setNotice('Progress updated.');
      setDetail(d => ({ ...d, date: f.date, weight: f.weight != null ? Number(f.weight) : d.weight, bodyFat: f.bodyFat != null ? Number(f.bodyFat) : d.bodyFat, chest: f.chest != null ? Number(f.chest) : d.chest, waist: f.waist != null ? Number(f.waist) : d.waist, hips: f.hips != null ? Number(f.hips) : d.hips, arms: f.arms != null ? Number(f.arms) : d.arms, thighs: f.thighs != null ? Number(f.thighs) : d.thighs, notes: f.notes }));
      refresh();
      closeM();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  const doDelete = async (r) => {
    setBusy(true);
    try {
      await deleteProgress(r._id);
      setNotice('Record deleted.');
      setDetail(null);
      refresh();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  /* ── Form state ─────────────────────────────────────────────────── */

  const [form, setForm] = useState({
    member: '', date: '', weight: '', bodyFat: '',
    chest: '', waist: '', hips: '', arms: '', thighs: '',
    notes: '',
  });

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* ── Detail view ────────────────────────────────────────────────── */

  if (id) {
    return (
      <OwnerLayout title='PROGRESS DETAIL' subtitle={detail ? 'Viewing progress record' : ''}>
        <div className='ft-detail-actions'>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={() => refresh()}>← BACK TO PROGRESS</button>
          {detail && (
            <>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => openEdit(detail)}>EDIT</button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setConfirm({ kind: 'delete', record: detail })}>DELETE</button>
            </>
          )}
        </div>

        {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

        {dLoading ? (
          <div className='ft-members-skeleton'>{Array.from({ length: 6 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
        ) : lE && !detail ? (
          <div className='ft-empty'>
            <div className='ft-kicker'>UNABLE TO LOAD PROGRESS</div>
            <p>{lE}</p>
            <button type='button' className='ft-btn ft-btn-ghost' onClick={loadDetail}>RETRY</button>
          </div>
        ) : detail ? (
          <div className='ft-detail-grid'>
            <section className='ft-detail-card ft-detail-wide'>
              <div className='ft-kicker'>PROGRESS RECORD</div>
              <dl className='ft-detail-list'>
                <div>
                  <dt>MEMBER</dt>
                  <dd><Link to={`/owner/members/${detail.user?._id}`} className='ft-member-name'>{detail.user?.name || '—'}</Link></dd>
                </div>
                <div><dt>DATE</dt><dd className='ft-mono'>{fmtD(detail.date)}</dd></div>
                <div><dt>WEIGHT (kg)</dt><dd className='ft-mono'>{detail.weight != null ? Number(detail.weight).toFixed(2) : '—'}</dd></div>
                <div><dt>BODY FAT (%)</dt><dd className='ft-mono'>{detail.bodyFat != null ? Number(detail.bodyFat).toFixed(2) : '—'}</dd></div>
              </dl>
            </section>

            <section className='ft-detail-card'>
              <div className='ft-kicker'>BODY MEASUREMENTS (cm)</div>
              <dl className='ft-detail-list'>
                <div><dt>CHEST</dt><dd className='ft-mono'>{detail.chest != null ? Number(detail.chest).toFixed(1) : '—'}</dd></div>
                <div><dt>WAIST</dt><dd className='ft-mono'>{detail.waist != null ? Number(detail.waist).toFixed(1) : '—'}</dd></div>
                <div><dt>HIPS</dt><dd className='ft-mono'>{detail.hips != null ? Number(detail.hips).toFixed(1) : '—'}</dd></div>
                <div><dt>ARMS</dt><dd className='ft-mono'>{detail.arms != null ? Number(detail.arms).toFixed(1) : '—'}</dd></div>
                <div><dt>THIGHS</dt><dd className='ft-mono'>{detail.thighs != null ? Number(detail.thighs).toFixed(1) : '—'}</dd></div>
              </dl>
            </section>

            {detail.notes && (
              <section className='ft-detail-card'>
                <div className='ft-kicker'>NOTES</div>
                <p className='ft-mono' style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{detail.notes}</p>
              </section>
            )}

            <section className='ft-detail-card'>
              <div className='ft-kicker'>META</div>
              <dl className='ft-detail-list'>
                <div><dt>CREATED</dt><dd className='ft-mono'>{fmtD(detail.createdAt)}</dd></div>
                <div><dt>ID</dt><dd className='ft-mono ft-id' style={{ wordBreak: 'break-all' }}>{detail._id}</dd></div>
              </dl>
            </section>
          </div>
        ) : null}

        {modal && (
          <div className='ft-modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) closeM(); }}>
            <div className='ft-modal' role='dialog' aria-modal='true'>
              <div className='ft-modal-header'>
                <h3>{modal.mode === 'create' ? 'ADD PROGRESS RECORD' : 'EDIT PROGRESS'}</h3>
                <button type='button' className='ft-icon-btn' onClick={closeM} disabled={busy}>✕</button>
              </div>
              {modal.mode === 'edit' && modal.initial && (
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
                  Editing record for {modal.initial.user?.name || '—'} on {fmtD(modal.initial.date)}
                </p>
              )}
              <form onSubmit={e => { e.preventDefault(); modal.mode === 'create' ? doCreate(form) : doUpdate(form); }}>
                <div className='ft-field'><span>Member *</span><select value={form.member} onChange={setF('member')} required>
                  <option value=''>Select member…</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select></div>

                <div className='ft-field'><span>Date</span><input type='date' value={form.date} onChange={setF('date')} /></div>

                <div className='ft-field'><span>Weight (kg)</span><input type='number' min='0' step='0.1' value={form.weight} onChange={setF('weight')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Body Fat (%)</span><input type='number' min='0' max='100' step='0.1' value={form.bodyFat} onChange={setF('bodyFat')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Chest (cm)</span><input type='number' min='0' step='0.1' value={form.chest} onChange={setF('chest')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Waist (cm)</span><input type='number' min='0' step='0.1' value={form.waist} onChange={setF('waist')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Hips (cm)</span><input type='number' min='0' step='0.1' value={form.hips} onChange={setF('hips')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Arms (cm)</span><input type='number' min='0' step='0.1' value={form.arms} onChange={setF('arms')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Thighs (cm)</span><input type='number' min='0' step='0.1' value={form.thighs} onChange={setF('thighs')} placeholder='0.0' /></div>

                <div className='ft-field'><span>Notes</span><textarea rows={3} value={form.notes} onChange={setF('notes')} placeholder='Optional observations…' /></div>

                <div className='ft-modal-actions'>
                  <button type='button' className='ft-btn ft-btn-ghost' onClick={closeM} disabled={busy}>CANCEL</button>
                  <button type='submit' className='ft-btn' disabled={busy} style={{ background: 'var(--lime)', color: '#0c0f05', borderColor: 'var(--lime)' }}>
                    {busy ? 'SAVING…' : modal.mode === 'create' ? 'ADD RECORD' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirm && (
          <ConfirmDialog
            title='DELETE PROGRESS RECORD'
            message={`Delete progress record for ${confirm.record.user?.name}?`}
            label='DELETE'
            warn={true}
            onCancel={closeC}
            onConfirm={() => doDelete(confirm.record)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  /* ── List view ─────────────────────────────────────────────────── */

  const totalWeight = records.reduce((s, r) => s + (Number(r.weight) || 0), 0);

  return (
    <OwnerLayout title='PROGRESS MANAGEMENT' subtitle='Track member body metrics and measurements'>
      {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

      {loading ? (
        <div className='ft-members-skeleton'>{Array.from({ length: 8 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
      ) : lE ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>UNABLE TO LOAD PROGRESS</div>
          <p>{lE}</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={loadList}>RETRY</button>
        </div>
      ) : records.length === 0 ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>NO PROGRESS RECORDS FOUND</div>
          <p>No progress records match the current filters.</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={refresh}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className='ft-payments-metrics'>
            <StatCard l='TOTAL RECORDS' v={meta.total} />
            <StatCard l='MEMBERS TRACKED' v={new Set(records.map(r => r.user?._id)).size} />
            <StatCard l='RECENT WEIGHT' v={records.length ? '₹' + totalWeight.toFixed(1) : 0} />
          </div>

          <div className='ft-members-toolbar'>
            <div className='ft-search'>
              <input type='text' placeholder='Search member…' value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <button type='button' className='ft-btn ft-btn-ghost ft-search-btn' onClick={() => { setSearch(''); setPage(1); }}>CLEAR</button>
            </div>
            <div className='ft-members-filters'>
              <select value={memberF} onChange={e => { setMemberF(e.target.value); setPage(1); }}>
                <option value=''>ALL MEMBERS</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <input type='date' className='ft-members-filters input' value={dateF} onChange={e => { setDateF(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <input type='date' className='ft-members-filters input' value={fromD} onChange={e => { setFromD(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <input type='date' className='ft-members-filters input' value={toD} onChange={e => { setToD(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => { setMemberF(''); setDateF(''); setFromD(''); setToD(''); setSearch(''); setPage(1); }}>CLEAR FILTERS</button>
            </div>
            <button type='button' className='ft-btn ft-btn-primary' onClick={openCreate}>+ ADD PROGRESS</button>
          </div>

          <div className='ft-members-table-wrap'>
            <table className='ft-members-table'>
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>DATE</th>
                  <th>WEIGHT (kg)</th>
                  <th>BODY FAT (%)</th>
                  <th>CHEST (cm)</th>
                  <th>WAIST (cm)</th>
                  <th>NOTES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td><Link to={`/owner/members/${r.user?._id}`} className='ft-member-name'>{r.user?.name || '—'}</Link></td>
                    <td className='ft-mono'>{fmtD(r.date)}</td>
                    <td className='ft-mono'>{r.weight != null ? Number(r.weight).toFixed(2) : '—'}</td>
                    <td className='ft-mono'>{r.bodyFat != null ? Number(r.bodyFat).toFixed(2) : '—'}</td>
                    <td className='ft-mono'>{r.chest != null ? Number(r.chest).toFixed(1) : '—'}</td>
                    <td className='ft-mono'>{r.waist != null ? Number(r.waist).toFixed(1) : '—'}</td>
                    <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className='ft-mono'>{r.notes || '—'}</td>
                    <td>
                      <div className='ft-row-actions'>
                        <Link to={`/owner/progress/${r._id}`} className='ft-link'>VIEW</Link>
                        <button type='button' className='ft-link' onClick={() => openEdit(r)}>EDIT</button>
                        <button type='button' className='ft-link ft-link-danger' onClick={() => setConfirm({ kind: 'delete', record: r })}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='ft-pagination'>
            <span className='ft-pagination-info'>PAGE {meta.page} OF {meta.pages || 0} · TOTAL {meta.total}</span>
            <div className='ft-pagination-btns'>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage(p => p + 1)} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <div className='ft-modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) closeM(); }}>
          <div className='ft-modal' role='dialog' aria-modal='true'>
            <div className='ft-modal-header'>
              <h3>{modal.mode === 'create' ? 'ADD PROGRESS RECORD' : 'EDIT PROGRESS'}</h3>
              <button type='button' className='ft-icon-btn' onClick={closeM} disabled={busy}>✕</button>
            </div>
            {modal.mode === 'edit' && modal.initial && (
              <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
                Editing record for {modal.initial.user?.name || '—'} on {fmtD(modal.initial.date)}
              </p>
            )}
            <form onSubmit={e => { e.preventDefault(); modal.mode === 'create' ? doCreate(form) : doUpdate(form); }}>
              <div className='ft-field'><span>Member *</span><select value={form.member} onChange={setF('member')} required>
                <option value=''>Select member…</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select></div>
              <div className='ft-field'><span>Date</span><input type='date' value={form.date} onChange={setF('date')} /></div>
              <div className='ft-field'><span>Weight (kg)</span><input type='number' min='0' step='0.1' value={form.weight} onChange={setF('weight')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Body Fat (%)</span><input type='number' min='0' max='100' step='0.1' value={form.bodyFat} onChange={setF('bodyFat')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Chest (cm)</span><input type='number' min='0' step='0.1' value={form.chest} onChange={setF('chest')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Waist (cm)</span><input type='number' min='0' step='0.1' value={form.waist} onChange={setF('waist')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Hips (cm)</span><input type='number' min='0' step='0.1' value={form.hips} onChange={setF('hips')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Arms (cm)</span><input type='number' min='0' step='0.1' value={form.arms} onChange={setF('arms')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Thighs (cm)</span><input type='number' min='0' step='0.1' value={form.thighs} onChange={setF('thighs')} placeholder='0.0' /></div>
              <div className='ft-field'><span>Notes</span><textarea rows={3} value={form.notes} onChange={setF('notes')} placeholder='Optional observations…' /></div>
              <div className='ft-modal-actions'>
                <button type='button' className='ft-btn ft-btn-ghost' onClick={closeM} disabled={busy}>CANCEL</button>
                <button type='submit' className='ft-btn' disabled={busy} style={{ background: 'var(--lime)', color: '#0c0f05', borderColor: 'var(--lime)' }}>
                  {busy ? 'SAVING…' : modal.mode === 'create' ? 'ADD RECORD' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title='DELETE PROGRESS RECORD'
          message={`Delete progress record for ${confirm.record.user?.name}?`}
          label='DELETE'
          warn={true}
          onCancel={closeC}
          onConfirm={() => doDelete(confirm.record)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
