import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listAttendance,
  createAttendance,
  updateAttendance,
  patchAttendanceStatus,
  deleteAttendance,
  getAttendance,
} from '../services/attendanceService';
import { listMembers } from '../services/memberService';

const LIMIT = 10;
const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'CLEARED'];
const ST = {
  PRESENT: 'ft-pill-active',
  ABSENT: 'ft-pill-inactive',
  LATE: 'ft-pill-pending',
  EXCUSED: 'ft-pill-pending',
  CLEARED: 'ft-pill-inactive',
};

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDT(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function getErrorMessage(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

function StatusPill({ status }) {
  return <span className={`ft-pill ${ST[status] || 'ft-pill-inactive'}`}>{status || '—'}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="ft-stat-card">
      <div className="ft-stat-value">{value}</div>
      <div className="ft-stat-label">{label}</div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, warn, onCancel, onConfirm, busy }) {
  return (
    <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
      <div className="ft-modal ft-modal-sm">
        <div className="ft-modal-header">
          <h3>{title}</h3>
          <button type="button" className="ft-icon-btn" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{message}</p>
        <div className="ft-modal-actions">
          <button type="button" className="ft-btn ft-btn-ghost" onClick={onCancel} disabled={busy}>CANCEL</button>
          <button
            type="button"
            className={`ft-btn ${warn ? 'ft-btn-danger' : 'ft-btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'PROCESSING…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendanceFormModal({ open, mode, initial, members, busy, onClose, onSubmit }) {
  const [form, setForm] = useState({
    member: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      member: initial?.user?._id || initial?.user || initial?.member?._id || initial?.member || '',
      date: initial?.date ? String(initial.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      checkIn: initial?.checkIn ? String(initial.checkIn).slice(0, 16) : '',
      checkOut: initial?.checkOut ? String(initial.checkOut).slice(0, 16) : '',
      status: initial?.status || 'PRESENT',
      notes: initial?.notes || '',
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.member) return setError('Member is required');
    if (!form.date) return setError('Date is required');
    onSubmit(form);
  };

  return (
    <div
      className="ft-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="ft-modal" role="dialog" aria-modal="true">
        <div className="ft-modal-header">
          <h3>{mode === 'create' ? 'RECORD ATTENDANCE' : 'EDIT ATTENDANCE'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy}>✕</button>
        </div>
        {error && <div className="ft-alert ft-alert-error">{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-field">
            <span>Member *</span>
            <select value={form.member} onChange={set('member')} disabled={mode === 'edit'}>
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m.email}
                </option>
              ))}
            </select>
          </div>

          <div className="ft-field">
            <span>Date *</span>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>

          <div className="ft-field ft-grid-2">
            <div>
              <span>Check In</span>
              <input type="datetime-local" value={form.checkIn} onChange={set('checkIn')} />
            </div>
            <div>
              <span>Check Out</span>
              <input type="datetime-local" value={form.checkOut} onChange={set('checkOut')} />
            </div>
          </div>

          <div className="ft-field">
            <span>Status</span>
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ft-field">
            <span>Notes</span>
            <textarea rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional notes…" />
          </div>

          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>CANCEL</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy ? 'SAVING…' : mode === 'create' ? 'RECORD ATTENDANCE' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnerAttendance() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [memberFilter, setMemberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [attendance, setAttendance] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [metrics, setMetrics] = useState({ present: 0, absent: 0, late: 0, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [members, setMembers] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      const [todayPres, todayAbs, todayLate, allRec] = await Promise.all([
        listAttendance({ date: 'today', status: 'PRESENT', limit: 1 }),
        listAttendance({ date: 'today', status: 'ABSENT', limit: 1 }),
        listAttendance({ date: 'today', status: 'LATE', limit: 1 }),
        listAttendance({ limit: 1 }),
      ]);
      setMetrics({
        present: todayPres?.meta?.total ?? 0,
        absent: todayAbs?.meta?.total ?? 0,
        late: todayLate?.meta?.total ?? 0,
        totalRecords: allRec?.meta?.total ?? 0,
      });
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listAttendance({
        page,
        limit: LIMIT,
        user: memberFilter || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setAttendance(body?.data || []);
      setMeta(body?.meta || { page, pages: 0, total: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, memberFilter, statusFilter, dateFilter, fromDate, toDate]);

  const loadMembers = useCallback(async () => {
    try {
      const mb = await listMembers({ status: 'active', limit: 200 });
      setMembers(mb?.data || []);
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setDetailLoading(true);
    setLoadError('');
    try {
      const body = await getAttendance(id);
      setDetail(body?.data || null);
      if (!body?.data) setLoadError('Attendance record not found');
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMembers();
    loadMetrics();
  }, [loadMembers, loadMetrics]);

  useEffect(() => {
    if (id) {
      loadDetail();
    } else {
      loadList();
    }
  }, [id, loadList, loadDetail]);

  const refreshList = () => {
    setPage(1);
    loadList();
    loadMetrics();
  };

  const closeModal = () => setModal(null);
  const closeConfirm = () => setConfirm(null);

  const openCreateModal = () => setModal({ mode: 'create', initial: null });
  const openEditModal = (a) => setModal({ mode: 'edit', initial: a });

  const handleCreate = async (f) => {
    setBusy(true);
    try {
      await createAttendance({
        user: f.member,
        date: f.date,
        checkIn: f.checkIn || undefined,
        checkOut: f.checkOut || undefined,
        status: f.status,
        notes: f.notes || undefined,
      });
      setNotice('Attendance recorded successfully.');
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (f) => {
    const targetId = id || f._id;
    if (!targetId) return;
    setBusy(true);
    try {
      await updateAttendance(targetId, {
        checkIn: f.checkIn || undefined,
        checkOut: f.checkOut || undefined,
        status: f.status,
        notes: f.notes || undefined,
      });
      setNotice('Attendance updated.');
      if (id) loadDetail();
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (a, status) => {
    setBusy(true);
    try {
      await patchAttendanceStatus(a._id, status);
      setNotice(`Attendance status updated to ${status}.`);
      if (detail?._id === a._id) setDetail((d) => ({ ...d, status }));
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (a) => {
    setBusy(true);
    try {
      await deleteAttendance(a._id);
      setNotice('Attendance record removed.');
      if (detail?._id === a._id) setDetail(null);
      navigate('/owner/attendance');
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Detail view
  if (id) {
    return (
      <OwnerLayout title="ATTENDANCE RECORD" subtitle={detail ? `Record for ${detail.user?.name || 'Member'}` : ''}>
        <div className="ft-detail-actions">
          <Link to="/owner/attendance" className="ft-btn ft-btn-ghost">← BACK TO ATTENDANCE</Link>
          {detail && (
            <>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => openEditModal(detail)}>EDIT</button>
              <select
                value={detail.status}
                onChange={(e) => handleStatusChange(detail, e.target.value)}
                disabled={busy}
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                className="ft-btn ft-btn-ghost ft-link-danger"
                onClick={() => setConfirm({ kind: 'delete', attendance: detail })}
                disabled={busy}
              >
                DELETE
              </button>
            </>
          )}
        </div>

        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        {detailLoading ? (
          <div className="ft-members-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ft-skeleton-row" />
            ))}
          </div>
        ) : loadError ? (
          <div className="ft-empty">
            <div className="ft-kicker">UNABLE TO LOAD RECORD</div>
            <p>{loadError}</p>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={loadDetail}>RETRY</button>
          </div>
        ) : detail ? (
          <div className="ft-detail-grid">
            <section className="ft-detail-card ft-detail-wide">
              <div className="ft-kicker">SESSION</div>
              <dl className="ft-detail-list">
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <StatusPill status={detail.status} />
                    <select
                      value={detail.status}
                      onChange={(e) => handleStatusChange(detail, e.target.value)}
                      disabled={busy}
                      style={{ marginLeft: 12, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div><dt>DATE</dt><dd className="ft-mono">{fmtDate(detail.date)}</dd></div>
                <div><dt>CHECK IN</dt><dd className="ft-mono">{detail.checkIn ? fmtDT(detail.checkIn) : '—'}</dd></div>
                <div><dt>CHECK OUT</dt><dd className="ft-mono">{detail.checkOut ? fmtDT(detail.checkOut) : '—'}</dd></div>
                <div><dt>RECORDED</dt><dd className="ft-mono">{fmtDate(detail.createdAt)}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">MEMBER</div>
              <dl className="ft-detail-list">
                <div>
                  <dt>NAME</dt>
                  <dd>
                    <Link to={`/owner/members/${detail.user?._id || ''}`} className="ft-member-name">
                      {detail.user?.name || '—'}
                    </Link>
                  </dd>
                </div>
                <div><dt>EMAIL</dt><dd className="ft-mono">{detail.user?.email || '—'}</dd></div>
                <div><dt>PHONE</dt><dd className="ft-mono">{detail.user?.phone || '—'}</dd></div>
              </dl>
            </section>

            {detail.notes && (
              <section className="ft-detail-card">
                <div className="ft-kicker">NOTES</div>
                <p className="ft-mono" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{detail.notes}</p>
              </section>
            )}

            <section className="ft-detail-card">
              <div className="ft-kicker">ID</div>
              <p className="ft-mono" style={{ color: 'var(--text-faint)', wordBreak: 'break-all' }}>{detail._id}</p>
            </section>
          </div>
        ) : null}

        {modal && (
          <AttendanceFormModal
            open={!!modal}
            mode={modal.mode}
            initial={modal.initial}
            members={members}
            busy={busy}
            onClose={closeModal}
            onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
          />
        )}

        {confirm && (
          <ConfirmDialog
            title="DELETE ATTENDANCE"
            message={`Remove attendance record on ${fmtDate(confirm.attendance?.date)} for ${confirm.attendance?.user?.name}?`}
            confirmLabel="DELETE"
            warn
            onCancel={closeConfirm}
            onConfirm={() => handleDelete(confirm.attendance)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  // List view
  return (
    <OwnerLayout title="ATTENDANCE MANAGEMENT" subtitle="Track and manage member attendance">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {/* Real metrics */}
      <div className="ft-payments-metrics">
        <StatCard label="TODAY PRESENT" value={metrics.present} />
        <StatCard label="TODAY ABSENT" value={metrics.absent} />
        <StatCard label="LATE" value={metrics.late} />
        <StatCard label="TOTAL RECORDS" value={metrics.totalRecords} />
      </div>

      {/* Filters toolbar */}
      <div className="ft-members-toolbar">
        <div className="ft-members-filters" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <select value={memberFilter} onChange={(e) => { setMemberFilter(e.target.value); setPage(1); }}>
            <option value="">ALL MEMBERS</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">ALL STATUS</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            title="Specific date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px' }}
          />

          <input
            type="date"
            title="From date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px' }}
          />

          <input
            type="date"
            title="To date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px' }}
          />

          <button
            type="button"
            className="ft-btn ft-btn-ghost"
            onClick={() => { setMemberFilter(''); setStatusFilter(''); setDateFilter(''); setFromDate(''); setToDate(''); setPage(1); }}
          >
            CLEAR FILTERS
          </button>
        </div>

        <button type="button" className="ft-btn ft-btn-primary" onClick={openCreateModal}>
          + RECORD ATTENDANCE
        </button>
      </div>

      {loading ? (
        <div className="ft-members-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ft-skeleton-row" />
          ))}
        </div>
      ) : loadError ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD ATTENDANCE</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : attendance.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO ATTENDANCE RECORDS FOUND</div>
          <p>No records match the selected filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refreshList}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>DATE</th>
                  <th>CHECK IN</th>
                  <th>CHECK OUT</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <Link to={`/owner/members/${a.user?._id || ''}`} className="ft-member-name">
                        {a.user?.name || '—'}
                      </Link>
                    </td>
                    <td className="ft-mono">{fmtDate(a.date)}</td>
                    <td className="ft-mono">{a.checkIn ? fmtDT(a.checkIn) : '—'}</td>
                    <td className="ft-mono">{a.checkOut ? fmtDT(a.checkOut) : '—'}</td>
                    <td>
                      <StatusPill status={a.status} />
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                        disabled={busy}
                        style={{ marginLeft: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.notes || '—'}
                    </td>
                    <td>
                      <div className="ft-row-actions">
                        <button type="button" className="ft-link" onClick={() => openEditModal(a)}>EDIT</button>
                        <button
                          type="button"
                          className="ft-link ft-link-danger"
                          onClick={() => setConfirm({ kind: 'delete', attendance: a })}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ft-pagination">
            <span className="ft-pagination-info">
              PAGE {meta.page} OF {meta.pages || 1} · TOTAL {meta.total}
            </span>
            <div className="ft-pagination-btns">
              <button
                type="button"
                className="ft-btn ft-btn-ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                PREVIOUS
              </button>
              <button
                type="button"
                className="ft-btn ft-btn-ghost"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.pages}
              >
                NEXT
              </button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <AttendanceFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          members={members}
          busy={busy}
          onClose={closeModal}
          onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="DELETE ATTENDANCE"
          message={`Remove attendance record on ${fmtDate(confirm.attendance?.date)} for ${confirm.attendance?.user?.name}?`}
          confirmLabel="DELETE"
          warn
          onCancel={closeConfirm}
          onConfirm={() => handleDelete(confirm.attendance)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
