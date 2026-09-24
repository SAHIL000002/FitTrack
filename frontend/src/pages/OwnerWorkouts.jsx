import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  patchWorkoutStatus,
  deleteWorkout,
  getWorkout,
} from '../services/workoutService';
import { listMembers } from '../services/memberService';
import { listTrainers } from '../services/trainerService';
import { listPrograms } from '../services/programService';

const LIMIT = 10;
const WORKOUT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];
const ST = { PLANNED: 'ft-pill-active', IN_PROGRESS: 'ft-pill-pending', COMPLETED: 'ft-pill-active', SKIPPED: 'ft-pill-inactive' };

function fmtD(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function fmtDT(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function gm(e) { return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong'; }

function StatusPill({ status }) { return <span className={"ft-pill " + (ST[status] || 'ft-pill-inactive')}>{status || '—'}</span>; }

function StatCard({ label, value }) {
  return (
    <div className='ft-stat-card'>
      <div className='ft-stat-value'>{value}</div>
      <div className='ft-stat-label'>{label}</div>
    </div>
  );
}

/* Confirm dialog */

function ConfirmDialog({ title, message, confirmLabel, warn, onCancel, onConfirm, busy }) {
  return (
    <div className='ft-modal-overlay' role='alertdialog' aria-modal='true'>
      <div className='ft-modal ft-modal-sm'>
        <div className='ft-modal-header'>
          <h3>{title}</h3>
          <button type='button' className='ft-icon-btn' onClick={onCancel} aria-label='Close'>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{message}</p>
        <div className='ft-modal-actions'>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={onCancel} disabled={busy}>CANCEL</button>
          <button type='button' className={"ft-btn " + (warn ? 'ft-btn-danger' : 'ft-btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy ? 'PROCESSING…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Workout form modal */

function WorkoutFormModal({ open, mode, initial, members, trainers, programs, busy, onClose, onSubmit }) {
  const [form, setForm] = useState({
    user: '',
    trainer: '',
    program: '',
    title: '',
    date: '',
    status: 'PLANNED',
    notes: '',
    exercises: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      user: initial?.user?._id || initial?.user || '',
      trainer: initial?.trainer?._id || initial?.trainer || '',
      program: initial?.program?._id || initial?.program || '',
      title: initial?.title || '',
      date: initial?.date ? String(initial.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: initial?.status || 'PLANNED',
      notes: initial?.notes || '',
      exercises: Array.isArray(initial?.exercises) ? initial.exercises.map((x) => ({
        name: x.name || '',
        sets: x.sets != null ? Number(x.sets) : 3,
        reps: x.reps != null ? Number(x.reps) : 10,
        weight: x.weight != null ? Number(x.weight) : 0,
        duration: x.duration != null ? Number(x.duration) : 0,
        rest: x.rest != null ? Number(x.rest) : 60,
        notes: x.notes || '',
      })) : [],
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addExercise = () => {
    setForm((f) => ({
      ...f,
      exercises: [
        ...f.exercises,
        { name: '', sets: 3, reps: 10, weight: 0, duration: 0, rest: 60, notes: '' },
      ],
    }));
  };

  const updateExercise = (index, field, value) => {
    setForm((f) => {
      const updated = [...f.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, exercises: updated };
    });
  };

  const removeExercise = (index) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.filter((_, i) => i !== index),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.user) return setError('Member is required');
    if (!form.date) return setError('Date is required');
    onSubmit(form);
  };

  return (
    <div className='ft-modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className='ft-modal ft-modal-lg' role='dialog' aria-modal='true' style={{ maxWidth: '720px' }}>
        <div className='ft-modal-header'>
          <h3>{mode === 'create' ? 'CREATE WORKOUT' : 'EDIT WORKOUT'}</h3>
          <button type='button' className='ft-icon-btn' onClick={onClose} disabled={busy} aria-label='Close'>✕</button>
        </div>
        {error && <div className='ft-alert ft-alert-error'>{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className='ft-field'>
            <span>Member *</span>
            <select value={form.user} onChange={set('user')} disabled={mode === 'edit'}>
              <option value=''>Select member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
              ))}
            </select>
          </div>

          <div className='ft-form-grid'>
            <div className='ft-field'>
              <span>Trainer</span>
              <select value={form.trainer} onChange={set('trainer')}>
                <option value=''>No trainer assigned</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className='ft-field'>
              <span>Program</span>
              <select value={form.program} onChange={set('program')}>
                <option value=''>No program</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='ft-form-grid'>
            <div className='ft-field'>
              <span>Title</span>
              <input type='text' value={form.title} onChange={set('title')} placeholder='e.g. Upper Body Push' />
            </div>

            <div className='ft-field'>
              <span>Date *</span>
              <input type='date' value={form.date} onChange={set('date')} />
            </div>
          </div>

          <div className='ft-field'>
            <span>Status</span>
            <select value={form.status} onChange={set('status')}>
              {WORKOUT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Exercise Builder */}
          <div className='ft-field'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>Exercises ({form.exercises.length})</span>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={addExercise} style={{ padding: '6px 12px', fontSize: '11px' }}>
                + ADD EXERCISE
              </button>
            </div>
            {form.exercises.map((ex, idx) => (
              <div key={idx} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="ft-mono" style={{ fontSize: '11px', color: 'var(--lime)' }}>EXERCISE #{idx + 1}</span>
                  <button type='button' className='ft-btn ft-btn-ghost ft-link-danger' onClick={() => removeExercise(idx)} style={{ padding: '2px 8px', fontSize: '11px' }}>
                    REMOVE
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type='text'
                    placeholder='Exercise name'
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='Sets'
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value))}
                  />
                  <input
                    type='number'
                    min='0'
                    placeholder='Reps'
                    value={ex.reps}
                    onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value))}
                  />
                  <input
                    type='number'
                    min='0'
                    step='0.5'
                    placeholder='Weight (kg)'
                    value={ex.weight}
                    onChange={(e) => updateExercise(idx, 'weight', Number(e.target.value))}
                  />
                </div>
                <input
                  type='text'
                  placeholder='Notes (e.g. 60s rest, drop set)'
                  value={ex.notes}
                  onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className='ft-field'>
            <span>Notes</span>
            <textarea rows={3} value={form.notes} onChange={set('notes')} placeholder='Optional notes…' />
          </div>

          <div className='ft-modal-actions'>
            <button type='button' className='ft-btn ft-btn-ghost' onClick={onClose} disabled={busy}>CANCEL</button>
            <button type='submit' className='ft-btn ft-btn-primary' disabled={busy}>
              {busy ? 'SAVING…' : mode === 'create' ? 'CREATE WORKOUT' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnerWorkouts() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [workouts, setWorkouts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [programs, setPrograms] = useState([]);

  const params = {
    page,
    limit: LIMIT,
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(memberFilter ? { user: memberFilter } : {}),
    ...(trainerFilter ? { trainer: trainerFilter } : {}),
    ...(programFilter ? { program: programFilter } : {}),
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listWorkouts(params);
      setWorkouts(body?.data || []);
      setMeta(body?.meta || { page, pages: 0, total: 0 });
    } catch (err) {
      setLoadError(gm(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadReferences = useCallback(async () => {
    try {
      const [mb, tr, pr] = await Promise.all([
        listMembers({ role: 'MEMBER', status: 'active', limit: 200 }),
        listTrainers({ limit: 200 }),
        listPrograms({ limit: 200 }),
      ]);
      setMembers(mb?.data || []);
      setTrainers(tr?.data || []);
      setPrograms(pr?.data || []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    loadReferences();
    if (id) {
      setDetailLoading(true);
      setLoadError('');
      loadDetail().catch(() => {});
    } else {
      loadList();
    }
  }, [id]);

  const loadDetail = async () => {
    try {
      const body = await getWorkout(id);
      setDetail(body?.data || null);
      if (!body?.data) setLoadError('Not found');
    } catch (err) {
      setLoadError(gm(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshList = () => { setPage(1); loadList(); };
  const closeModal = () => setModal(null);
  const closeConfirm = () => setConfirm(null);

  const handleCreate = async (form) => {
    setBusy(true);
    try {
      await createWorkout({
        user: form.user,
        trainer: form.trainer || undefined,
        program: form.program || undefined,
        title: form.title || undefined,
        date: form.date,
        status: form.status,
        notes: form.notes || undefined,
      });
      setNotice('Workout created.');
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(gm(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!id) return;
    setBusy(true);
    try {
      await updateWorkout(id, {
        trainer: form.trainer || undefined,
        program: form.program || undefined,
        title: form.title || undefined,
        date: form.date,
        status: form.status,
        notes: form.notes || undefined,
      });
      setNotice('Workout updated.');
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(gm(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (w, newStatus) => {
    setBusy(true);
    try {
      await patchWorkoutStatus(w._id, newStatus);
      setNotice('Status → ' + newStatus + '.');
      if (detail?._id === w._id) setDetail((d) => ({ ...d, status: newStatus }));
      refreshList();
    } catch (err) {
      setNotice(gm(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (w) => {
    setBusy(true);
    try {
      await deleteWorkout(w._id);
      setNotice('Workout deleted.');
      if (detail?._id === w._id) setDetail(null);
      navigate('/owner/workouts');
      refreshList();
    } catch (err) {
      setNotice(gm(err));
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => setModal({ mode: 'create', initial: null });
  const openEdit = (w) => setModal({ mode: 'edit', initial: w });
  const openEditFromDetail = () => id && setModal({ mode: 'edit', initial: detail });

  const totalScheduled = workouts.filter((w) => w.status === 'PLANNED').length;
  const totalCompleted = workouts.filter((w) => w.status === 'COMPLETED').length;

  /* Detail */

  if (id) {
    return (
      <OwnerLayout title='WORKOUT DETAIL' subtitle={detail ? 'Viewing workout' : ''}>
        <div className='ft-detail-actions'>
          <Link to='/owner/workouts' className='ft-btn ft-btn-ghost'>← BACK TO WORKOUTS</Link>
          {detail && (
            <>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={openEditFromDetail}>EDIT</button>
              <select
                value={detail.status}
                onChange={(ev) => handleStatusChange(detail, ev.target.value)}
                disabled={busy}
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
              >
                {WORKOUT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type='button' className='ft-btn ft-btn-ghost ft-link-danger' onClick={() => setConfirm({ kind: 'delete', workout: detail })}>
                DELETE
              </button>
            </>
          )}
        </div>

        {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

        {loadError && !detailLoading ? (
          <div className='ft-empty'>
            <div className='ft-kicker'>UNABLE TO LOAD WORKOUT</div>
            <p>{loadError}</p>
            <button type='button' className='ft-btn ft-btn-ghost' onClick={loadDetail}>RETRY</button>
          </div>
        ) : detailLoading ? (
          <div className='ft-members-skeleton'>{Array.from({ length: 6 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
        ) : detail ? (
          <div className='ft-detail-grid'>
            <section className='ft-detail-card ft-detail-wide'>
              <div className='ft-kicker'>WORKOUT</div>
              <dl className='ft-detail-list'>
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <StatusPill status={detail.status} />
                    <select
                      value={detail.status}
                      onChange={(ev) => handleStatusChange(detail, ev.target.value)}
                      disabled={busy}
                      style={{ marginLeft: 12, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                    >
                      {WORKOUT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div><dt>TITLE</dt><dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase' }}>{detail.title || '—'}</dd></div>
                <div><dt>DATE</dt><dd className='ft-mono'>{fmtD(detail.date)}</dd></div>
                <div><dt>NOTES</dt><dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 4 }}>{detail.notes || '—'}</dd></div>
              </dl>
            </section>

            <section className='ft-detail-card'>
              <div className='ft-kicker'>MEMBER</div>
              <dl className='ft-detail-list'>
                <div><dt>NAME</dt><dd><Link to={`/owner/members/${detail.user?._id}`} className='ft-member-name'>{detail.user?.name || '—'}</Link></dd></div>
                <div><dt>EMAIL</dt><dd className='ft-mono'>{detail.user?.email || '—'}</dd></div>
                <div><dt>PHONE</dt><dd className='ft-mono'>{detail.user?.phone || '—'}</dd></div>
              </dl>
            </section>

            {detail.trainer && (
              <section className='ft-detail-card'>
                <div className='ft-kicker'>TRAINER</div>
                <dl className='ft-detail-list'>
                  <div><dt>NAME</dt><dd><Link to={`/owner/trainers/${detail.trainer._id}`} className='ft-member-name'>{detail.trainer.name}</Link></dd></div>
                  <div><dt>ROLE</dt><dd className='ft-mono'>{detail.trainer.role || '—'}</dd></div>
                </dl>
              </section>
            )}

            {detail.program && (
              <section className='ft-detail-card'>
                <div className='ft-kicker'>PROGRAM</div>
                <dl className='ft-detail-list'>
                  <div><dt>NAME</dt><dd><Link to={`/owner/programs/${detail.program._id}`}>{detail.program.name}</Link></dd></div>
                  <div><dt>CATEGORY</dt><dd className='ft-mono'>{detail.program.category || '—'}</dd></div>
                </dl>
              </section>
            )}

            <section className='ft-detail-card'>
              <div className='ft-kicker'>META</div>
              <dl className='ft-detail-list'>
                <div><dt>CREATED</dt><dd className='ft-mono'>{fmtDT(detail.createdAt)}</dd></div>
                <div><dt>ID</dt><dd className='ft-mono ft-id' style={{ wordBreak: 'break-all' }}>{detail._id}</dd></div>
              </dl>
            </section>
          </div>
        ) : null}

        {modal && (
          <WorkoutFormModal
            open={!!modal}
            mode={modal.mode}
            initial={modal.initial}
            members={members}
            trainers={trainers}
            programs={programs}
            busy={busy}
            onClose={closeModal}
            onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
          />
        )}

        {confirm && (
          <ConfirmDialog
            title='DELETE WORKOUT'
            message={`Delete workout "${confirm.workout.title || 'Unnamed'}" for ${confirm.workout.user?.name}?`}
            confirmLabel='DELETE'
            warn={true}
            onCancel={closeConfirm}
            onConfirm={() => handleDelete(confirm.workout)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  /* List */

  return (
    <OwnerLayout title='WORKOUT MANAGEMENT' subtitle='Create and track member workout sessions'>
      {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

      {loading ? (
        <div className='ft-members-skeleton'>{Array.from({ length: 8 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
      ) : loadError ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>UNABLE TO LOAD WORKOUTS</div>
          <p>{loadError}</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={loadList}>RETRY</button>
        </div>
      ) : workouts.length === 0 ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>NO WORKOUTS FOUND</div>
          <p>No workout sessions match the current filters.</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={refreshList}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className='ft-payments-metrics'>
            <StatCard label='TOTAL WORKOUTS' value={meta.total} />
            <StatCard label='PLANNED' value={totalScheduled} />
            <StatCard label='COMPLETED' value={totalCompleted} />
          </div>

          <div className='ft-members-toolbar'>
            <div className='ft-search'>
              <input
                type='text'
                placeholder='Search member, title…'
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type='button' className='ft-btn ft-btn-ghost ft-search-btn' onClick={() => { setSearch(''); setPage(1); }}>
                CLEAR
              </button>
            </div>
            <div className='ft-members-filters'>
              <select value={memberFilter} onChange={(e) => { setMemberFilter(e.target.value); setPage(1); }}>
                <option value=''>ALL MEMBERS</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <select value={trainerFilter} onChange={(e) => { setTrainerFilter(e.target.value); setPage(1); }}>
                <option value=''>ALL TRAINERS</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <select value={programFilter} onChange={(e) => { setProgramFilter(e.target.value); setPage(1); }}>
                <option value=''>ALL PROGRAMS</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value=''>ALL STATUS</option>
                {WORKOUT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input type='date' className='ft-members-filters input' value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <input type='date' className='ft-members-filters input' value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => { setMemberFilter(''); setTrainerFilter(''); setProgramFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); setSearch(''); setPage(1); }}>
                CLEAR FILTERS
              </button>
            </div>
            <button type='button' className='ft-btn ft-btn-primary' onClick={openCreate}>+ CREATE WORKOUT</button>
          </div>

          <div className='ft-members-table-wrap'>
            <table className='ft-members-table'>
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>TRAINER</th>
                  <th>PROGRAM</th>
                  <th>TITLE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>RECORDED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <Link to={`/owner/members/${w.user?._id}`} className='ft-member-name'>{w.user?.name || '—'}</Link>
                    </td>
                    <td>
                      {w.trainer ? (
                        <Link to={`/owner/trainers/${w.trainer._id}`} className='ft-link'>{w.trainer.name}</Link>
                      ) : (
                        <span className='ft-mono' style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {w.program ? (
                        <Link to={`/owner/programs/${w.program._id}`} className='ft-link'>{w.program.name}</Link>
                      ) : (
                        <span className='ft-mono' style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--white)', textTransform: 'uppercase', fontWeight: 700, fontSize: '13px' }}>{w.title || '—'}</td>
                    <td className='ft-mono' style={{ color: 'var(--text-faint)' }}>{fmtD(w.date)}</td>
                    <td>
                      <StatusPill status={w.status} />
                      <select
                        value={w.status}
                        onChange={(ev) => handleStatusChange(w, ev.target.value)}
                        className='ft-select-mini'
                        style={{ marginLeft: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                        disabled={busy}
                      >
                        {WORKOUT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className='ft-mono' style={{ color: 'var(--text-faint)' }}>{fmtD(w.createdAt)}</td>
                    <td>
                      <div className='ft-row-actions'>
                        <Link to={`/owner/workouts/${w._id}`} className='ft-link'>VIEW</Link>
                        <button type='button' className='ft-link' onClick={() => openEdit(w)}>EDIT</button>
                        <button type='button' className='ft-link ft-link-danger' onClick={() => setConfirm({ kind: 'delete', workout: w })}>
                          DELETE
                        </button>
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
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage((p) => p + 1)} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <WorkoutFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          members={members}
          trainers={trainers}
          programs={programs}
          busy={busy}
          onClose={closeModal}
          onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title='DELETE WORKOUT'
          message={`Delete workout "${confirm.workout.title || 'Unnamed'}" for ${confirm.workout.user?.name}?`}
          confirmLabel='DELETE'
          warn={true}
          onCancel={closeConfirm}
          onConfirm={() => handleDelete(confirm.workout)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
