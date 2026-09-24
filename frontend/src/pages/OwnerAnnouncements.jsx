import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncementStatus,
  deleteAnnouncement,
} from '../services/announcementService';

const LIMIT = 10;
const AUDIENCES = ['ALL', 'MEMBERS'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const PRIORITY_META = {
  LOW: 'ft-pill-inactive',
  NORMAL: 'ft-pill-pending',
  HIGH: 'ft-pill-active',
  URGENT: 'ft-pill-active',
};

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getErrorMessage(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

function PriorityPill({ priority }) {
  return <span className={`ft-pill ${PRIORITY_META[priority] || 'ft-pill-inactive'}`}>{priority || '—'}</span>;
}

function AudiencePill({ audience }) {
  return <span className="ft-pill" style={{ borderColor: 'var(--text-faint)', color: 'var(--text-muted)' }}>{audience || 'ALL'}</span>;
}

function ActivePill({ active }) {
  return <span className={`ft-pill ${active ? 'ft-pill-active' : 'ft-pill-inactive'}`}>{active ? 'ACTIVE' : 'INACTIVE'}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="ft-stat-card">
      <div className="ft-stat-value">{value}</div>
      <div className="ft-stat-label">{label}</div>
    </div>
  );
}

/* ── Confirm dialog ───────────────────────────────────── */

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

/* ── Announcement form modal (create / edit) ───────────────────────── */

function AnnouncementFormModal({
  open, mode, initial, busy, onClose, onSubmit,
}) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'ALL',
    priority: 'NORMAL',
    isActive: true,
    publishAt: '',
    expiresAt: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      title: initial?.title || '',
      message: initial?.message || '',
      audience: initial?.audience || 'ALL',
      priority: initial?.priority || 'NORMAL',
      isActive: initial?.isActive != null ? initial.isActive : true,
      publishAt: initial?.publishAt ? String(initial.publishAt).slice(0, 10) : '',
      expiresAt: initial?.expiresAt ? String(initial.expiresAt).slice(0, 10) : '',
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.message.trim()) return setError('Message is required');
    onSubmit(form);
  };

  return (
    <div
      className="ft-modal-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className="ft-modal" role="dialog" aria-modal="true">
        <div className="ft-modal-header">
          <h3>{mode === 'create' ? 'NEW ANNOUNCEMENT' : 'EDIT ANNOUNCEMENT'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy} aria-label="Close">✕</button>
        </div>
        {error && <div className="ft-alert ft-alert-error">{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-field">
            <span>Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Announcement title"
              maxLength={120}
            />
          </div>

          <div className="ft-field">
            <span>Message *</span>
            <textarea
              rows={5}
              value={form.message}
              onChange={set('message')}
              placeholder="Announcement content for gym members…"
            />
          </div>

          <div className="ft-field">
            <span>Audience</span>
            <select value={form.audience} onChange={set('audience')}>
              <option value="ALL">All Members</option>
              <option value="MEMBERS">Members Only</option>
            </select>
          </div>

          <div className="ft-field">
            <span>Priority</span>
            <select value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="ft-field ft-check">
            <label className="ft-checkbox">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={setBool('isActive')}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="ft-field">
            <span>Publish Date</span>
            <input
              type="date"
              value={form.publishAt}
              onChange={(e) => setForm(f => ({ ...f, publishAt: e.target.value || '' }))}
            />
          </div>

          <div className="ft-field">
            <span>Expiry Date</span>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value || '' }))}
            />
          </div>

          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>
              CANCEL
            </button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy
                ? 'SAVING…'
                : mode === 'create' ? 'CREATE ANNOUNCEMENT' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Detail sub-view ─────────────────────────── */

function AnnouncementDetailView({
  announcement, onBack, onEdit, onToggle, onDelete, busy, notice,
}) {
  return (
    <OwnerLayout title="ANNOUNCEMENT DETAIL" subtitle="Viewing announcement">
      <div className="ft-detail-actions">
        <Link to="/owner/announcements" className="ft-btn ft-btn-ghost">
          ← BACK TO ANNOUNCEMENTS
        </Link>
        {announcement && (
          <>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onEdit}>EDIT</button>
            <button
              type="button"
              className="ft-btn ft-btn-ghost"
              onClick={() => onToggle(!announcement.isActive)}
              disabled={busy}
            >
              {announcement.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
            <button
              type="button"
              className="ft-btn ft-btn-ghost ft-link-danger"
              onClick={onDelete}
              disabled={busy}
            >
              DELETE
            </button>
          </>
        )}
      </div>

      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {!announcement ? (
        <div className="ft-empty">
          <div className="ft-kicker">NOT FOUND</div>
          <p>This announcement may have been deleted.</p>
          <Link to="/owner/announcements" className="ft-btn ft-btn-ghost">RETURN TO LIST</Link>
        </div>
      ) : (
        <div className="ft-detail-grid">
          <section className="ft-detail-card ft-detail-wide">
            <div className="ft-kicker">ANNOUNCEMENT</div>
            <dl className="ft-detail-list">
              <div>
                <dt>STATUS</dt>
                <dd>
                  <ActivePill active={announcement.isActive} />
                  <button
                    type="button"
                    className="ft-btn ft-btn-ghost"
                    style={{ marginLeft: 12, padding: '8px 16px', fontSize: '11px' }}
                    onClick={() => onToggle(!announcement.isActive)}
                    disabled={busy}
                  >
                    {announcement.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                </dd>
              </div>
              <div>
                <dt>PRIORITY</dt>
                <dd><PriorityPill priority={announcement.priority} /></dd>
              </div>
              <div>
                <dt>AUDIENCE</dt>
                <dd><AudiencePill audience={announcement.audience} /></dd>
              </div>
              <div>
                <dt>TITLE</dt>
                <dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '18px' }}>
                  {announcement.title}
                </dd>
              </div>
              <div>
                <dt>MESSAGE</dt>
                <dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 8 }}>
                  {announcement.message}
                </dd>
              </div>
            </dl>
          </section>

          <section className="ft-detail-card">
            <div className="ft-kicker">SCHEDULE</div>
            <dl className="ft-detail-list">
              <div>
                <dt>PUBLISH DATE</dt>
                <dd className="ft-mono">{fmtDate(announcement.publishAt)}</dd>
              </div>
              <div>
                <dt>EXPIRY DATE</dt>
                <dd className="ft-mono">{fmtDate(announcement.expiresAt)}</dd>
              </div>
              <div>
                <dt>CREATED</dt>
                <dd className="ft-mono">{fmtDate(announcement.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="ft-detail-card">
            <div className="ft-kicker">META</div>
            <dl className="ft-detail-list">
              <div>
                <dt>CREATED BY</dt>
                <dd className="ft-mono">
                  {announcement.createdBy?.name || announcement.createdBy?.email || '—'}
                </dd>
              </div>
              <div>
                <dt>ID</dt>
                <dd className="ft-mono ft-id" style={{ wordBreak: 'break-all' }}>
                  {announcement._id}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </OwnerLayout>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function OwnerAnnouncements() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [announcements, setAnnouncements] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const params = {
    page,
    limit: LIMIT,
    search: search || undefined,
    isActive: statusFilter || undefined,
    audience: audienceFilter || undefined,
    priority: priorityFilter || undefined,
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listAnnouncements(params);
      setAnnouncements(body?.data || []);
      setMeta(body?.meta || { page, pages: 0, total: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadDetail = async () => {
    setDetailLoading(true);
    setLoadError('');
    try {
      const body = await getAnnouncement(id);
      setDetail(body?.data || null);
      if (!body?.data) setLoadError('Not found');
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail().catch(() => {});
    } else {
      loadList();
    }
  }, [id]);

  const refreshList = () => { setPage(1); loadList(); };
  const closeModal = () => setModal(null);
  const closeConfirm = () => setConfirm(null);

  const handleCreate = async (form) => {
    setBusy(true);
    try {
      await createAnnouncement({
        title: form.title || undefined,
        message: form.message || undefined,
        audience: form.audience || 'ALL',
        priority: form.priority || 'NORMAL',
        isActive: form.isActive != null ? form.isActive : true,
        publishAt: form.publishAt || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setNotice('Announcement created.');
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!id) return;
    setBusy(true);
    try {
      await updateAnnouncement(id, {
        title: form.title || undefined,
        message: form.message || undefined,
        audience: form.audience || 'ALL',
        priority: form.priority || 'NORMAL',
        isActive: form.isActive != null ? form.isActive : true,
        publishAt: form.publishAt || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setNotice('Announcement updated.');
      loadDetail();
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (a, newActive) => {
    setBusy(true);
    try {
      await patchAnnouncementStatus(a._id, newActive);
      setNotice((newActive ? 'Announcement activated.' : 'Announcement deactivated.'));
      if (detail?._id === a._id) setDetail(d => ({ ...d, isActive: newActive }));
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
      await deleteAnnouncement(a._id);
      setNotice('Announcement deleted.');
      if (detail?._id === a._id) setDetail(null);
      navigate('/owner/announcements');
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => setModal({ mode: 'create', initial: null });
  const openEdit = (a) => setModal({ mode: 'edit', initial: a });

  const totalActive = announcements.filter(a => a.isActive).length;
  const totalUrgent = announcements.filter(a => a.priority === 'URGENT' && a.isActive).length;

  if (id) {
    return (
      <AnnouncementDetailView
        announcement={detail}
        announcementLoading={detailLoading}
        loadError={loadError}
        onBack={() => navigate('/owner/announcements')}
        onEdit={() => openEdit(detail)}
        onStatusChange={(newActive) => handleStatusChange(detail, newActive)}
        onDelete={() => setConfirm({ kind: 'delete', announcement: detail })}
        busy={busy}
        notice={notice}
      />
    );
  }

  return (
    <OwnerLayout title="ANNOUNCEMENT MANAGEMENT" subtitle="Create and manage gym announcements">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {loading ? (
        <div className="ft-members-skeleton">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}
        </div>
      ) : loadError ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD ANNOUNCEMENTS</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO ANNOUNCEMENTS FOUND</div>
          <p>No announcements match the current filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refreshList}>
            CLEAR FILTERS
          </button>
        </div>
      ) : (
        <>
          <div className="ft-payments-metrics">
            <StatCard label="TOTAL ANNOUNCEMENTS" value={meta.total} />
            <StatCard label="ACTIVE" value={totalActive} />
            <StatCard label="URGENT ACTIVE" value={totalUrgent} />
          </div>

          <div className="ft-members-toolbar">
            <div className="ft-search">
              <input
                type="text"
                placeholder="Search title, message…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type="button" className="ft-btn ft-btn-ghost ft-search-btn" onClick={() => { setSearch(''); setPage(1); }}>
                CLEAR
              </button>
            </div>
            <div className="ft-members-filters">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">ALL STATUS</option>
                <option value="true">ACTIVE</option>
                <option value="false">INACTIVE</option>
              </select>
              <select value={audienceFilter} onChange={(e) => { setAudienceFilter(e.target.value); setPage(1); }}>
                <option value="">ALL AUDIENCES</option>
                <option value="ALL">ALL MEMBERS</option>
                <option value="MEMBERS">MEMBERS ONLY</option>
              </select>
              <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
                <option value="">ALL PRIORITIES</option>
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setStatusFilter(''); setAudienceFilter(''); setPriorityFilter(''); setSearch(''); setPage(1); }}>
                CLEAR FILTERS
              </button>
            </div>
            <button type="button" className="ft-btn ft-btn-primary" onClick={openCreate}>
              + NEW ANNOUNCEMENT
            </button>
          </div>

          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>AUDIENCE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>PUBLISH DATE</th>
                  <th>EXPIRY DATE</th>
                  <th>CREATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
                        {a.title || '—'}
                      </div>
                      {a.message && (
                        <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {a.message}
                        </div>
                      )}
                    </td>
                    <td><AudiencePill audience={a.audience} /></td>
                    <td><PriorityPill priority={a.priority} /></td>
                    <td>
                      <ActivePill active={a.isActive} />
                      <button
                        type="button"
                        className="ft-link"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleStatusChange(a, !a.isActive)}
                        disabled={busy}
                      >
                        {a.isActive ? ' DEACTIVATE' : 'ACTIVATE'}
                      </button>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(a.publishAt)}</td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(a.expiresAt)}</td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(a.createdAt)}</td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/announcements/${a._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link" onClick={() => openEdit(a)}>EDIT</button>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', announcement: a })}>
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
            <span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages || 0} · TOTAL {meta.total}</span>
            <div className="ft-pagination-btns">
              <button
                type="button"
                className="ft-btn ft-btn-ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                PREVIOUS
              </button>
              <button
                type="button"
                className="ft-btn ft-btn-ghost"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= meta.pages}
              >
                NEXT
              </button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <AnnouncementFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          busy={busy}
          onClose={closeModal}
          onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="DELETE ANNOUNCEMENT"
          message={`Delete announcement "${confirm.announcement.title}"? It will be soft-deleted.`}
          confirmLabel="DELETE"
          warn
          onCancel={closeConfirm}
          onConfirm={() => handleDelete(confirm.announcement)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
