import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listTrainers,
  createTrainer,
  updateTrainer,
  patchTrainerStatus,
  deleteTrainer,
  getTrainer,
} from '../services/trainerService';

const LIMIT = 10;
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const ST = {
  ACTIVE: 'ft-pill-active',
  INACTIVE: 'ft-pill-inactive',
  SUSPENDED: 'ft-pill-pending',
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
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getErrorMessage(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

function StatusPill({ status }) {
  return <span className={`ft-pill ${ST[status] || 'ft-pill-inactive'}`}>{status || '—'}</span>;
}

function StylePill({ styles }) {
  if (!styles || styles.length === 0) return null;
  return (
    <div className="ft-styles">
      {styles.slice(0, 4).map((s) => (
        <span key={s} className="ft-style-tag">{s}</span>
      ))}
    </div>
  );
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

function TrainerFormModal({ open, mode, initial, allStyles, busy, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'TRAINER',
    specialty: '',
    experience: '',
    trainingStyle: [],
    description: '',
    image: '',
    featured: false,
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      name: initial?.name || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      role: initial?.role || 'TRAINER',
      specialty: initial?.specialty || '',
      experience: initial?.experience || '',
      trainingStyle: initial?.trainingStyle || [],
      description: initial?.description || '',
      image: initial?.image || '',
      featured: initial?.featured || false,
      status: initial?.status || 'ACTIVE',
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleStyle = (style) => {
    setForm((f) => ({
      ...f,
      trainingStyle: f.trainingStyle.includes(style)
        ? f.trainingStyle.filter((s) => s !== style)
        : [...f.trainingStyle, style],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
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
          <h3>{mode === 'create' ? 'ADD TRAINER' : 'EDIT TRAINER'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy}>✕</button>
        </div>
        {error && <div className="ft-alert ft-alert-error">{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-field">
            <span>Full Name *</span>
            <input type="text" value={form.name} onChange={set('name')} placeholder="John Carter" />
          </div>

          <div className="ft-field ft-grid-2">
            <div>
              <span>Email</span>
              <input type="email" value={form.email} onChange={set('email')} placeholder="trainer@gym.com" />
            </div>
            <div>
              <span>Phone</span>
              <input type="text" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="ft-field">
            <span>Role</span>
            <select value={form.role} onChange={set('role')}>
              <option value="TRAINER">Trainer</option>
              <option value="SENIOR_TRAINER">Senior Trainer</option>
              <option value="HEAD_TRAINER">Head Trainer</option>
              <option value="COACH">Coach</option>
            </select>
          </div>

          <div className="ft-field">
            <span>Specialty</span>
            <input type="text" value={form.specialty} onChange={set('specialty')} placeholder="Strength Training, Weight Loss, Yoga…" />
          </div>

          <div className="ft-field">
            <span>Experience</span>
            <input type="text" value={form.experience} onChange={set('experience')} placeholder="5+ years" />
          </div>

          <div className="ft-field">
            <span>Training Styles</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {allStyles.map((s) => (
                <label key={s} className="ft-check">
                  <input
                    type="checkbox"
                    checked={form.trainingStyle.includes(s)}
                    onChange={() => toggleStyle(s)}
                  />
                  <span>{s.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ft-field">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="Brief trainer bio…" />
          </div>

          <div className="ft-field">
            <span>Profile Image URL</span>
            <input type="text" value={form.image} onChange={set('image')} placeholder="https://…" />
          </div>

          <div className="ft-field ft-check">
            <label className="ft-checkbox">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              <span>Featured Trainer</span>
            </label>
          </div>

          <div className="ft-field">
            <span>Status</span>
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>CANCEL</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy ? 'SAVING…' : mode === 'create' ? 'ADD TRAINER' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnerTrainers() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [trainers, setTrainers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [allStyles, setAllStyles] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const params = {
    page,
    limit: LIMIT,
    search: search || undefined,
    featured: featuredFilter || undefined,
    trainingStyle: styleFilter || undefined,
    status: statusFilter || undefined,
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listTrainers({
        page,
        limit: LIMIT,
        search: search || undefined,
        featured: featuredFilter || undefined,
        trainingStyle: styleFilter || undefined,
      });
      let data = body?.data || [];
      if (statusFilter === 'ACTIVE') {
        data = data.filter((t) => t.isActive !== false);
      } else if (statusFilter === 'INACTIVE') {
        data = data.filter((t) => t.isActive === false);
      }
      setTrainers(data);
      setMeta(body?.meta || { page, pages: 0, total: data.length });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, featuredFilter, styleFilter, statusFilter]);

  useEffect(() => {
    const load = async () => {
      if (id) {
        setDetailLoading(true);
        setLoadError('');
        try {
          const body = await getTrainer(id);
          setDetail(body?.data || null);
          if (!body?.data) setLoadError('Trainer not found');
        } catch (err) {
          setLoadError(getErrorMessage(err));
        } finally {
          setDetailLoading(false);
        }
      } else {
        loadList();
      }
      try {
        const styles = await listTrainerStyles();
        setAllStyles(styles?.data || []);
      } catch {}
    };
    load();
  }, [id, loadList]);

  const listTrainerStyles = async () => {
    try {
      const body = await listTrainers({ limit: 500 });
      const styles = new Set();
      (body?.data || []).forEach((t) => {
        const list = t.trainingStyles || t.trainingStyle || [];
        list.forEach((s) => styles.add(s));
      });
      return [...styles];
    } catch {
      return [];
    }
  };

  const refreshList = () => {
    setPage(1);
    loadList();
  };

  const closeModal = () => setModal(null);
  const closeConfirm = () => setConfirm(null);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const openCreateModal = () => setModal({ mode: 'create', initial: null });
  const openEditModal = (t) => setModal({ mode: 'edit', initial: t });

  const handleCreate = async (form) => {
    setBusy(true);
    try {
      await createTrainer({
        name: form.name.trim(),
        role: form.role || undefined,
        specialty: form.specialty?.trim() || undefined,
        experience: form.experience?.trim() || undefined,
        trainingStyles: form.trainingStyle?.length > 0 ? form.trainingStyle : undefined,
        bio: form.description?.trim() || form.bio?.trim() || undefined,
        image: form.image?.trim() || undefined,
        featured: Boolean(form.featured),
      });
      setNotice('Trainer added.');
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (form) => {
    const targetId = id || form._id;
    if (!targetId) return;
    setBusy(true);
    try {
      await updateTrainer(targetId, {
        name: form.name.trim(),
        role: form.role || undefined,
        specialty: form.specialty?.trim() || undefined,
        experience: form.experience?.trim() || undefined,
        trainingStyles: form.trainingStyle?.length > 0 ? form.trainingStyle : undefined,
        bio: form.description?.trim() || form.bio?.trim() || undefined,
        image: form.image?.trim() || undefined,
        featured: Boolean(form.featured),
      });
      setNotice('Trainer updated.');
      if (detail?._id === targetId) setDetail((d) => ({ ...d, ...form }));
      refreshList();
      closeModal();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (t, newStatus) => {
    setBusy(true);
    try {
      const active = newStatus === 'ACTIVE' || newStatus === true;
      await patchTrainerStatus(t._id, active);
      setNotice(`Trainer ${active ? 'activated' : 'deactivated'}.`);
      if (detail?._id === t._id) setDetail((d) => ({ ...d, isActive: active, status: newStatus }));
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (t) => {
    setBusy(true);
    try {
      await deleteTrainer(t._id);
      setNotice('Trainer deleted.');
      if (detail?._id === t._id) setDetail(null);
      navigate('/owner/trainers');
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (id) {
    return (
      <OwnerLayout title="TRAINER DETAIL" subtitle={detail ? 'Viewing trainer profile' : ''}>
        <div className="ft-detail-actions">
          <Link to="/owner/trainers" className="ft-btn ft-btn-ghost">← BACK TO TRAINERS</Link>
          {detail && (
            <>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => openEditModal(detail)}>EDIT</button>
              <select
                value={detail.status}
                onChange={(ev) => handleStatusChange(detail, ev.target.value)}
                disabled={busy}
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={() => setConfirm({ kind: 'delete', t: detail })}>DELETE</button>
            </>
          )}
        </div>

        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        {detailLoading ? (
          <div className="ft-members-skeleton">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="ft-skeleton-row" />))}</div>
        ) : loadError ? (
          <div className="ft-empty">
            <div className="ft-kicker">UNABLE TO LOAD TRAINER</div>
            <p>{loadError}</p>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setDetailLoading(true); setLoadError(''); }}>RETRY</button>
          </div>
        ) : detail ? (
          <div className="ft-detail-grid">
            <section className="ft-detail-card ft-detail-wide">
              <div className="ft-kicker">TRAINER</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
                {detail.image ? (
                  <img
                    src={detail.image}
                    alt={detail.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid var(--border)', background: 'var(--bg-deep)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      fontWeight: 900,
                      color: 'var(--text-faint)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {detail.name?.charAt(0) || 'T'}
                  </div>
                )}
                <div>
                  <div style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.02em' }}>
                    {detail.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 4 }}>
                    {detail.role || 'TRAINER'}
                  </div>
                </div>
              </div>
              <dl className="ft-detail-list">
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
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div>
                  <dt>FEATURED</dt>
                  <dd>
                    <span className={`ft-pill ${detail.featured ? 'ft-pill-active' : 'ft-pill-inactive'}`}>
                      {detail.featured ? 'YES' : 'NO'}
                    </span>
                  </dd>
                </div>
                <div><dt>SPECIALTY</dt><dd style={{ color: 'var(--text-muted)' }}>{detail.specialty || '—'}</dd></div>
                <div><dt>EXPERIENCE</dt><dd className="ft-mono">{detail.experience || '—'}</dd></div>
                <div><dt>DESCRIBED AS</dt><dd style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{detail.description || '—'}</dd></div>
                <div><dt>TRAINING STYLES</dt><dd>
                  {detail.trainingStyle && detail.trainingStyle.length > 0 ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {detail.trainingStyle.map((s) => (
                        <span key={s} className="ft-style-tag">{s.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-faint)' }}>None listed</span>
                  )}
                </dd></div>
                <div><dt>EMAIL</dt><dd className="ft-mono">{detail.email || '—'}</dd></div>
                <div><dt>PHONE</dt><dd className="ft-mono">{detail.phone || '—'}</dd></div>
                <div><dt>PROFILE IMAGE</dt><dd>{detail.image ? <a href={detail.image} target="_blank" rel="noreferrer" className="ft-link">View</a> : <span style={{ color: 'var(--text-faint)' }}>Not set</span>}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">META</div>
              <dl className="ft-detail-list">
                <div><dt>CREATED</dt><dd className="ft-mono">{fmtDT(detail.createdAt)}</dd></div>
                <div><dt>UPDATED</dt><dd className="ft-mono">{fmtDT(detail.updatedAt)}</dd></div>
                <div><dt>ID</dt><dd className="ft-mono ft-id" style={{ wordBreak: 'break-all' }}>{detail._id}</dd></div>
              </dl>
            </section>
          </div>
        ) : null}

        {modal && (
          <TrainerFormModal
            open={!!modal}
            mode={modal.mode}
            initial={modal.initial}
            allStyles={allStyles}
            busy={busy}
            onClose={closeModal}
            onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
          />
        )}

        {confirm && (
          <ConfirmDialog
            title="DELETE TRAINER"
            message={`Delete trainer ${confirm.t.name}? They will be soft-deleted.`}
            confirmLabel="DELETE"
            warn={true}
            onCancel={closeConfirm}
            onConfirm={() => handleDelete(confirm.t)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="TRAINER MANAGEMENT" subtitle="Manage gym trainers and coaching staff">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {loading ? (
        <div className="ft-members-skeleton">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="ft-skeleton-row" />))}</div>
      ) : loadError ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD TRAINERS</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : trainers.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO TRAINERS FOUND</div>
          <p>No trainers match the current filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refreshList}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className="ft-payments-metrics">
            <StatCard label="TOTAL TRAINERS" value={meta.total} />
            <StatCard label="ACTIVE" value={trainers.filter((t) => t.status === 'ACTIVE').length} />
            <StatCard label="FEATURED" value={trainers.filter((t) => t.featured).length} />
          </div>

          <div className="ft-members-toolbar">
            <div className="ft-search">
              <input
                type="text"
                placeholder="Search name, specialty, role…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <button type="button" className="ft-btn ft-btn-ghost ft-search-btn" onClick={() => {
                setSearch('');
                setPage(1);
              }}>
                CLEAR
              </button>
            </div>
            <div className="ft-members-filters">
              <select value={featuredFilter} onChange={(e) => {
                setFeaturedFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">ALL TRAINERS</option>
                <option value="true">FEATURED ONLY</option>
              </select>
              <select value={styleFilter} onChange={(e) => {
                setStyleFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">ALL STYLES</option>
                {allStyles.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}>
                <option value="">ALL STATUS</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => {
                setFeaturedFilter('');
                setStyleFilter('');
                setStatusFilter('');
                setSearch('');
                setPage(1);
              }}>
                CLEAR FILTERS
              </button>
            </div>
            <button type="button" className="ft-btn ft-btn-primary" onClick={openCreateModal}>
              + ADD TRAINER
            </button>
          </div>

          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>TRAINER</th>
                  <th>ROLE</th>
                  <th>SPECIALTY</th>
                  <th>STYLES</th>
                  <th>FEATURED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {t.image ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            style={{ width: 40, height: 40, objectFit: 'cover', border: '1px solid var(--border)', background: 'var(--bg-deep)' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: 'var(--bg-deep)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 16,
                              fontWeight: 900,
                              color: 'var(--text-faint)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {t.name?.charAt(0) || 'T'}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <Link to={`/owner/trainers/${t._id}`} className="ft-member-name" style={{ fontSize: '14px' }}>
                            {t.name || '—'}
                          </Link>
                          <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: '11px' }}>
                            {t.role || 'TRAINER'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{t.role || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.specialty || '—'}
                    </td>
                    <td>
                      {t.trainingStyle && t.trainingStyle.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(t.trainingStyle || []).slice(0, 3).map((s) => (
                            <span key={s} className="ft-style-tag">{s.replace(/_/g, ' ')}</span>
                          ))}
                          {(t.trainingStyle || []).length > 3 && (
                            <span className="ft-style-tag" style={{ color: 'var(--text-faint)' }}>+{(t.trainingStyle || []).length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {t.featured ? (
                        <span className="ft-pill ft-pill-active">YES</span>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>NO</span>
                      )}
                    </td>
                    <td>
                      <StatusPill status={t.status} />
                      <select
                        value={t.status}
                        onChange={(ev) => handleStatusChange(t, ev.target.value)}
                        className="ft-select-mini"
                        style={{ marginLeft: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/trainers/${t._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link" onClick={() => openEditModal(t)}>EDIT</button>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', t })}>
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
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <TrainerFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          allStyles={allStyles}
          busy={busy}
          onClose={closeModal}
          onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="DELETE TRAINER"
          message={`Delete trainer ${confirm.t.name}? They will be soft-deleted.`}
          confirmLabel="DELETE"
          warn={true}
          onCancel={closeConfirm}
          onConfirm={() => handleDelete(confirm.t)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
