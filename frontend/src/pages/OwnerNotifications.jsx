import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listNotifications,
  getNotification,
  patchNotificationRead,
  deleteNotification,
} from '../services/notificationService';
import { listMembers } from '../services/memberService';

const LIMIT = 10;
const NOTIF_TYPES = ['INFO', 'WARNING', 'ALERT', 'PROMO', 'SYSTEM'];

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getErrorMessage(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

function TypePill({ type }) {
  const colors = {
    INFO: 'ft-pill-active',
    WARNING: 'ft-pill-pending',
    ALERT: 'ft-pill-inactive',
    PROMO: 'ft-pill-active',
    SYSTEM: 'ft-pill-inactive',
  };
  return <span className={`ft-pill ${colors[type] || 'ft-pill-inactive'}`}>{type || '—'}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="ft-stat-card">
      <div className="ft-stat-value">{value}</div>
      <div className="ft-stat-label">{label}</div>
    </div>
  );
}

export default function OwnerNotifications() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [members, setMembers] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const params = {
    page,
    limit: LIMIT,
    search: search || undefined,
    type: typeFilter || undefined,
    user: userFilter || undefined,
    isRead: isReadFilter || undefined,
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listNotifications(params);
      setNotifications(body?.data || []);
      setMeta(body?.meta || { page, pages: 0, total: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadMembers = useCallback(async () => {
    try {
      const mb = await listMembers({ role: 'MEMBER', status: 'active', limit: 200 });
      setMembers(mb?.data || []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (id) {
      setDetailLoading(true);
      listNotificationDetail().catch(() => {});
    } else {
      loadList();
    }
    loadMembers();
  }, [id]);

  const listNotificationDetail = async () => {
    try {
      const body = await getNotification(id);
      const d = body?.data;
      if (!d) throw new Error('Not found');
      setDetail(d);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshList = () => { setPage(1); loadList(); };

  const handleMarkRead = async (n, isRead) => {
    setBusy(true);
    try {
      await patchNotificationRead(n._id, isRead);
      setNotice(isRead ? 'Marked as read.' : 'Marked as unread.');
      if (detail?._id === n._id) setDetail((d) => ({ ...d, isRead }));
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (n) => {
    if (!window.confirm(`Delete this notification? It will be soft-deleted.`)) return;
    setBusy(true);
    try {
      await deleteNotification(n._id);
      setNotice('Notification deleted.');
      if (detail?._id === n._id) setDetail(null);
      navigate('/owner/notifications');
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Detail view ─────────────────────────────────────────────── */

  if (id) {
    return (
      <OwnerLayout title="NOTIFICATION DETAIL" subtitle={detail ? 'Viewing notification' : ''}>
        <div className="ft-detail-actions">
          <Link to="/owner/notifications" className="ft-btn ft-btn-ghost">← BACK TO NOTIFICATIONS</Link>
          {detail && (
            <>
              <button
                type="button"
                className="ft-btn ft-btn-ghost"
                onClick={() => handleMarkRead(detail, !detail.isRead)}
                disabled={busy}
              >
                {detail.isRead ? 'MARK UNREAD' : 'MARK READ'}
              </button>
              <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={() => setConfirm({ kind: 'delete', notification: detail })}>
                DELETE
              </button>
            </>
          )}
        </div>

        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        {loadError && !detailLoading ? (
          <div className="ft-empty">
            <div className="ft-kicker">UNABLE TO LOAD NOTIFICATION</div>
            <p>{loadError}</p>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={listNotificationDetail}>RETRY</button>
          </div>
        ) : detailLoading ? (
          <div className="ft-members-skeleton">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}</div>
        ) : detail ? (
          <div className="ft-detail-grid">
            <section className="ft-detail-card ft-detail-wide">
              <div className="ft-kicker">NOTIFICATION</div>
              <dl className="ft-detail-list">
                <div>
                  <dt>TYPE</dt>
                  <dd><TypePill type={detail.type} /></dd>
                </div>
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <span className={`ft-pill ${detail.isRead ? 'ft-pill-active' : 'ft-pill-pending'}`}>
                      {detail.isRead ? 'READ' : 'UNREAD'}
                    </span>
                    <button
                      type="button"
                      className="ft-btn ft-btn-ghost"
                      style={{ marginLeft: 12, padding: '8px 16px', fontSize: '11px' }}
                      onClick={() => handleMarkRead(detail, !detail.isRead)}
                      disabled={busy}
                    >
                      {detail.isRead ? 'MARK UNREAD' : 'MARK READ'}
                    </button>
                  </dd>
                </div>
                <div><dt>TITLE</dt><dd>{detail.title || '—'}</dd></div>
                <div><dt>MESSAGE</dt><dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{detail.message || '—'}</dd></div>
                <div><dt>RECEIVED</dt><dd className="ft-mono">{fmtDateTime(detail.createdAt)}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">RECIPIENT</div>
              <dl className="ft-detail-list">
                <div><dt>NAME</dt><dd>{detail.user?.name || '—'}</dd></div>
                <div><dt>EMAIL</dt><dd className="ft-mono">{detail.user?.email || '—'}</dd></div>
                <div><dt>ID</dt><dd className="ft-mono ft-id" style={{ wordBreak: 'break-all' }}>{detail.user?._id || '—'}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">ID</div>
              <p className="ft-mono" style={{ color: 'var(--text-faint)', wordBreak: 'break-all' }}>{detail._id}</p>
            </section>
          </div>
        ) : null}

        {confirm && (
          <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
            <div className="ft-modal ft-modal-sm">
              <div className="ft-modal-header">
                <h3>DELETE NOTIFICATION</h3>
                <button type="button" className="ft-icon-btn" onClick={closeConfirm} aria-label="Close">✕</button>
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>
                Delete this notification for {confirm.notification.user?.name}? It will be soft-deleted.
              </p>
              <div className="ft-modal-actions">
                <button type="button" className="ft-btn ft-btn-ghost" onClick={closeConfirm} disabled={busy}>CANCEL</button>
                <button type="button" className="ft-btn ft-btn-danger" onClick={() => handleDelete(confirm.notification)} disabled={busy}>
                  {busy ? 'DELETING…' : 'DELETE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </OwnerLayout>
    );
  }

  /* ── List view ───────────────────────────────────────────────── */

  return (
    <OwnerLayout title="NOTIFICATION MANAGEMENT" subtitle="View and manage notification activity">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {loading ? (
        <div className="ft-members-skeleton">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}</div>
      ) : loadError ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD NOTIFICATIONS</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO NOTIFICATIONS FOUND</div>
          <p>No notification records match the current filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refreshList}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className="ft-payments-metrics">
            <StatCard label="TOTAL NOTIFICATIONS" value={meta.total} />
            <StatCard label="UNREAD" value={unreadCount} />
            <StatCard label="READ" value={notifications.length - unreadCount} />
          </div>

          <div className="ft-members-toolbar">
            <div className="ft-search">
              <input
                type="text"
                placeholder="Search by title, message, member…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type="button" className="ft-btn ft-btn-ghost ft-search-btn" onClick={() => { setSearch(''); setPage(1); }}>CLEAR</button>
            </div>
            <div className="ft-members-filters">
              <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}>
                <option value="">ALL MEMBERS</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="">ALL TYPES</option>
                {NOTIF_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={isReadFilter} onChange={(e) => { setIsReadFilter(e.target.value); setPage(1); }}>
                <option value="">ALL STATUS</option>
                <option value="true">READ</option>
                <option value="false">UNREAD</option>
              </select>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setUserFilter(''); setTypeFilter(''); setIsReadFilter(''); setSearch(''); setPage(1); }}>
                CLEAR FILTERS
              </button>
            </div>
          </div>

          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>NOTIFICATION</th>
                  <th>RECIPIENT</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n._id}>
                    <td>
                      <div style={{ maxWidth: 240 }}>
                        <div style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
                          {n.title || '—'}
                        </div>
                        <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.message || ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Link to={`/owner/members/${n.user?._id}`} className="ft-member-name" style={{ fontSize: '14px' }}>
                        {n.user?.name || '—'}
                      </Link>
                    </td>
                    <td><TypePill type={n.type} /></td>
                    <td>
                      <span className={`ft-pill ${n.isRead ? 'ft-pill-active' : 'ft-pill-pending'}`}>
                        {n.isRead ? 'READ' : 'UNREAD'}
                      </span>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{fmtDateTime(n.createdAt)}</td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/notifications/${n._id}`} className="ft-link">VIEW</Link>
                        <button
                          type="button"
                          className="ft-link"
                          onClick={() => handleMarkRead(n, !n.isRead)}
                          disabled={busy}
                        >
                          {n.isRead ? ' MARK UNREAD' : 'MARK READ'}
                        </button>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', notification: n })}>
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

      {confirm && (
        <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
          <div className="ft-modal ft-modal-sm">
            <div className="ft-modal-header">
              <h3>DELETE NOTIFICATION</h3>
              <button type="button" className="ft-icon-btn" onClick={closeConfirm} aria-label="Close">✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Delete this notification for {confirm.notification.user?.name}? It will be soft-deleted.
            </p>
            <div className="ft-modal-actions">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={closeConfirm} disabled={busy}>CANCEL</button>
              <button type="button" className="ft-btn ft-btn-danger" onClick={() => handleDelete(confirm.notification)} disabled={busy}>
                {busy ? 'DELETING…' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
