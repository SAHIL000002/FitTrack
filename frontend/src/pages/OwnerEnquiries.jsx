import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listEnquiries,
  getEnquiry,
  updateEnquiry,
  patchEnquiryStatus,
  deleteEnquiry,
} from '../services/enquiryService';

const LIMIT = 10;
const ENQUIRY_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ENQUIRY_TYPES = ['GENERAL', 'MEMBERSHIP', 'TRAINING', 'EQUIPMENT', 'OTHER'];

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getErrorMessage(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

const STATUS_META = {
  NEW: 'ft-pill-pending',
  IN_PROGRESS: 'ft-pill-active',
  RESOLVED: 'ft-pill-active',
  CLOSED: 'ft-pill-inactive',
};

function StatusPill({ status }) {
  return <span className={`ft-pill ${STATUS_META[status] || 'ft-pill-inactive'}`}>{status || '—'}</span>;
}

function TypePill({ type }) {
  return <span className="ft-pill" style={{ borderColor: 'var(--text-faint)', color: 'var(--text-muted)' }}>{type || '—'}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="ft-stat-card">
      <div className="ft-stat-value">{value}</div>
      <div className="ft-stat-label">{label}</div>
    </div>
  );
}

export default function OwnerEnquiries() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [enquiries, setEnquiries] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const params = {
    page,
    limit: LIMIT,
    search: search || undefined,
    status: statusFilter || undefined,
    enquiryType: typeFilter || undefined,
    preferredContact: contactFilter || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listEnquiries(params);
      setEnquiries(body?.data || []);
      setMeta(body?.meta || { page, pages: 0, total: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (id) {
      setDetailLoading(true);
      loadDetail().catch(() => {});
    } else {
      loadList();
    }
  }, [id]);

  const loadDetail = async () => {
    try {
      const body = await getEnquiry(id);
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

  const handleStatusChange = async (e, newStatus) => {
    setBusy(true);
    try {
      await patchEnquiryStatus(e._id, newStatus);
      setNotice(`Enquiry status → ${newStatus}.`);
      if (detail?._id === e._id) setDetail((d) => ({ ...d, status: newStatus }));
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (e) => {
    setBusy(true);
    try {
      await deleteEnquiry(e._id);
      setNotice('Enquiry deleted.');
      if (detail?._id === e._id) setDetail(null);
      navigate('/owner/enquiries');
      refreshList();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  /* ── Detail ─────────────────────────────────────────────────── */

  if (id) {
    return (
      <OwnerLayout title="ENQUIRY DETAIL" subtitle={detail ? 'Viewing enquiry' : ''}>
        <div className="ft-detail-actions">
          <Link to="/owner/enquiries" className="ft-btn ft-btn-ghost">← BACK TO ENQUIRIES</Link>
          {detail && (
            <>
              <select
                value={detail.status}
                onChange={(ev) => handleStatusChange(detail, ev.target.value)}
                className="ft-select-mini"
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={() => setConfirm({ kind: 'delete', enquiry: detail })}>
                DELETE
              </button>
            </>
          )}
        </div>

        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        {loadError && !detailLoading ? (
          <div className="ft-empty">
            <div className="ft-kicker">UNABLE TO LOAD ENQUIRY</div>
            <p>{loadError}</p>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={loadDetail}>RETRY</button>
          </div>
        ) : detailLoading ? (
          <div className="ft-members-skeleton">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}</div>
        ) : detail ? (
          <div className="ft-detail-grid">
            <section className="ft-detail-card ft-detail-wide">
              <div className="ft-kicker">ENQUIRY</div>
              <dl className="ft-detail-list">
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <StatusPill status={detail.status} />
                    <select
                      value={detail.status}
                      onChange={(ev) => handleStatusChange(detail, ev.target.value)}
                      className="ft-select-mini"
                      style={{ marginLeft: 12, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                    >
                      {ENQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div><dt>TYPE</dt><dd><TypePill type={detail.enquiryType} /></dd></div>
                <div><dt>PREFERRED CONTACT</dt><dd className="ft-mono">{detail.preferredContact || '—'}</dd></div>
                <div><dt>MESSAGE</dt><dd style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 4 }}>{detail.message || '—'}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">CONTACT</div>
              <dl className="ft-detail-list">
                <div><dt>NAME</dt><dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase' }}>{detail.name || '—'}</dd></div>
                <div><dt>EMAIL</dt><dd className="ft-mono">{detail.email || '—'}</dd></div>
                <div><dt>PHONE</dt><dd className="ft-mono">{detail.phone || '—'}</dd></div>
                <div><dt>SUBJECT</dt><dd style={{ color: 'var(--text-muted)' }}>{detail.subject || '—'}</dd></div>
              </dl>
            </section>

            <section className="ft-detail-card">
              <div className="ft-kicker">META</div>
              <dl className="ft-detail-list">
                <div><dt>CREATED</dt><dd className="ft-mono">{fmtDate(detail.createdAt)}</dd></div>
                <div><dt>UPDATED</dt><dd className="ft-mono">{fmtDate(detail.updatedAt)}</dd></div>
                <div><dt>ID</dt><dd className="ft-mono ft-id" style={{ wordBreak: 'break-all' }}>{detail._id}</dd></div>
              </dl>
            </section>
          </div>
        ) : null}

        {confirm && (
          <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
            <div className="ft-modal ft-modal-sm">
              <div className="ft-modal-header">
                <h3>DELETE ENQUIRY</h3>
                <button type="button" className="ft-icon-btn" onClick={closeConfirm} aria-label="Close">✕</button>
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>
                Delete enquiry from {confirm.enquiry.name}? It will be soft-deleted.
              </p>
              <div className="ft-modal-actions">
                <button type="button" className="ft-btn ft-btn-ghost" onClick={closeConfirm} disabled={busy}>CANCEL</button>
                <button type="button" className="ft-btn ft-btn-danger" onClick={() => handleDelete(confirm.enquiry)} disabled={busy}>
                  {busy ? 'DELETING…' : 'DELETE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </OwnerLayout>
    );
  }

  /* ── List ───────────────────────────────────────────────────── */

  return (
    <OwnerLayout title="ENQUIRY MANAGEMENT" subtitle="Track and respond to gym enquiries">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {loading ? (
        <div className="ft-members-skeleton">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}</div>
      ) : loadError ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD ENQUIRIES</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO ENQUIRIES FOUND</div>
          <p>No enquiries match the current filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refreshList}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className="ft-payments-metrics">
            <StatCard label="TOTAL ENQUIRIES" value={meta.total} />
            <StatCard label="NEW" value={enquiries.filter((e) => e.status === 'NEW').length} />
            <StatCard label="IN PROGRESS" value={enquiries.filter((e) => e.status === 'IN_PROGRESS').length} />
            <StatCard label="RESOLVED" value={enquiries.filter((e) => e.status === 'RESOLVED').length} />
          </div>

          <div className="ft-members-toolbar">
            <div className="ft-search">
              <input
                type="text"
                placeholder="Search name, email, subject…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type="button" className="ft-btn ft-btn-ghost ft-search-btn" onClick={() => { setSearch(''); setPage(1); }}>CLEAR</button>
            </div>
            <div className="ft-members-filters">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">ALL STATUS</option>
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="">ALL TYPES</option>
                {ENQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={contactFilter} onChange={(e) => { setContactFilter(e.target.value); setPage(1); }}>
                <option value="">ALL CONTACT</option>
                <option value="EMAIL">EMAIL</option>
                <option value="PHONE">PHONE</option>
                <option value="WHATSAPP">WHATSAPP</option>
              </select>
              <input type="date" className="ft-members-filters input" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <input type="date" className="ft-members-filters input" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px' }} />
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => { setStatusFilter(''); setTypeFilter(''); setContactFilter(''); setFromDate(''); setToDate(''); setSearch(''); setPage(1); }}>
                CLEAR FILTERS
              </button>
            </div>
          </div>

          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>CONTACT</th>
                  <th>CREATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
                        {e.name || '—'}
                      </div>
                      {e.subject && <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: '11px' }}>{e.subject}</div>}
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{e.email || '—'}</td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{e.phone || '—'}</td>
                    <td><TypePill type={e.enquiryType} /></td>
                    <td>
                      <StatusPill status={e.status} />
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e, ev.target.value)}
                        className="ft-select-mini"
                        style={{ marginLeft: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                      >
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{e.preferredContact || '—'}</td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(e.createdAt)}</td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/enquiries/${e._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', enquiry: e })}>
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
              <h3>DELETE ENQUIRY</h3>
              <button type="button" className="ft-icon-btn" onClick={closeConfirm} aria-label="Close">✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Delete enquiry from {confirm.enquiry.name}? It will be soft-deleted.
            </p>
            <div className="ft-modal-actions">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={closeConfirm} disabled={busy}>CANCEL</button>
              <button type="button" className="ft-btn ft-btn-danger" onClick={() => handleDelete(confirm.enquiry)} disabled={busy}>
                {busy ? 'DELETING…' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
