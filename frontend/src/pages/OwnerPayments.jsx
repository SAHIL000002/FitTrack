import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listPayments,
  createPayment,
  updatePayment,
  patchPaymentStatus,
  deletePayment,
  getPayment,
} from '../services/paymentService';
import { listMembers } from '../services/memberService';
import { listMemberships } from '../services/membershipService';

const LIMIT = 10;
const METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER'];
const STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
const ST = { PENDING: 'ft-pill-pending', PAID: 'ft-pill-active', FAILED: 'ft-pill-inactive', REFUNDED: 'ft-pill-inactive' };

function fmtD(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDT(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function gm(e) {
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong';
}

function P({ s }) {
  return <span className={'ft-pill ' + (ST[s] || 'ft-pill-inactive')}>{s || '—'}</span>;
}

function Confirm({ title, message, label, warn, onCancel, onConfirm, busy }) {
  return (
    <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
      <div className="ft-modal ft-modal-sm">
        <div className="ft-modal-header">
          <h3>{title}</h3>
          <button type="button" className="ft-icon-btn" onClick={onCancel}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{message}</p>
        <div className="ft-modal-actions">
          <button type="button" className="ft-btn ft-btn-ghost" onClick={onCancel} disabled={busy}>CANCEL</button>
          <button type="button" className={'ft-btn ' + (warn ? 'ft-btn-danger' : 'ft-btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy ? 'PROCESSING…' : label}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentFormModal({ open, mode, initial, members, mships, busy, onClose, onSubmit }) {
  const [f, setF] = useState({ user: '', membership: '', amount: '', method: 'CASH', status: 'PENDING', txn: '', pdate: '', notes: '' });
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setErr('');
    setF({
      user: initial?.user?._id || initial?.user || '',
      membership: initial?.membership?._id || initial?.membership || '',
      amount: initial?.amount != null ? String(initial.amount) : '',
      method: initial?.method || 'CASH',
      status: initial?.status || 'PENDING',
      txn: initial?.transactionId || '',
      pdate: initial?.paymentDate ? String(initial.paymentDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: initial?.notes || '',
    });
  }, [open, initial]);

  if (!open) return null;
  const S = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  // Filter memberships relevant to the chosen user
  const relevantMships = f.user
    ? mships.filter((ms) => (ms.user?._id || ms.user) === f.user)
    : mships;

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'create' && !f.user) return setErr('Member is required');
    if (mode === 'create' && !f.membership) return setErr('Membership is required');
    if (!f.amount || Number(f.amount) <= 0) return setErr('Valid amount is required');
    onSubmit(f);
  };

  return (
    <div className="ft-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="ft-modal" role="dialog" aria-modal="true">
        <div className="ft-modal-header">
          <h3>{mode === 'create' ? 'RECORD PAYMENT' : 'EDIT PAYMENT'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy}>✕</button>
        </div>
        {err && <div className="ft-alert ft-alert-error">{err}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-field">
            <span>Member *</span>
            <select value={f.user} onChange={S('user')} disabled={mode === 'edit'}>
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
              ))}
            </select>
          </div>
          <div className="ft-field">
            <span>Membership *</span>
            <select value={f.membership} onChange={S('membership')}>
              <option value="">Select membership…</option>
              {relevantMships.map((ms) => (
                <option key={ms._id} value={ms._id}>
                  {ms.plan?.name || ms.plan?.shortName || 'Plan'} · {fmtD(ms.startDate)} → {fmtD(ms.endDate)}
                </option>
              ))}
            </select>
            {f.user && relevantMships.length === 0 && (
              <span className="ft-field-hint" style={{ color: 'var(--amber)' }}>
                No memberships found for this member. Create a membership first or select another.
              </span>
            )}
          </div>
          <div className="ft-field">
            <span>Amount (₹) *</span>
            <input type="number" min="0" step="0.01" value={f.amount} onChange={S('amount')} placeholder="0.00" />
          </div>
          <div className="ft-field">
            <span>Method</span>
            <select value={f.method} onChange={S('method')}>
              {METHODS.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="ft-field">
            <span>Status</span>
            <select value={f.status} onChange={S('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="ft-field">
            <span>Transaction ID</span>
            <input type="text" value={f.txn} onChange={S('txn')} placeholder="TXN-00000" />
          </div>
          <div className="ft-field">
            <span>Payment Date</span>
            <input type="date" value={f.pdate} onChange={S('pdate')} />
          </div>
          <div className="ft-field">
            <span>Notes</span>
            <textarea rows={3} value={f.notes} onChange={S('notes')} placeholder="Optional notes…" />
          </div>
          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>CANCEL</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy ? 'SAVING…' : mode === 'create' ? 'RECORD PAYMENT' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnerPayments() {
  const nav = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [statusF, setStatusF] = useState('');
  const [methodF, setMethodF] = useState('');
  const [memberF, setMemberF] = useState('');
  const [fromD, setFromD] = useState('');
  const [toD, setToD] = useState('');

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [metrics, setMetrics] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });
  const [ld, setLd] = useState(true);
  const [lE, setLE] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [members, setMembers] = useState([]);
  const [mships, setMships] = useState([]);
  const [detail, setDetail] = useState(null);
  const [dld, setDld] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      const [allP, paidP, pendP] = await Promise.all([
        listPayments({ limit: 100 }),
        listPayments({ status: 'PAID', limit: 100 }),
        listPayments({ status: 'PENDING', limit: 1 }),
      ]);
      const rev = (paidP?.data || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
      setMetrics({
        total: allP?.meta?.total ?? 0,
        paid: paidP?.meta?.total ?? 0,
        pending: pendP?.meta?.total ?? 0,
        revenue: rev,
      });
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLd(true);
    setLE('');
    try {
      const b = await listPayments({
        page,
        limit: LIMIT,
        status: statusF || undefined,
        method: methodF || undefined,
        user: memberF || undefined,
        from: fromD || undefined,
        to: toD || undefined,
      });
      setList(b?.data || []);
      setMeta(b?.meta || { page, pages: 0, total: 0 });
    } catch (e) {
      setLE(gm(e));
    } finally {
      setLd(false);
    }
  }, [page, statusF, methodF, memberF, fromD, toD]);

  const loadSide = useCallback(async () => {
    try {
      const [mb, ms] = await Promise.all([
        listMembers({ status: 'active', limit: 200 }),
        listMemberships({ limit: 200 }),
      ]);
      setMembers(mb?.data || []);
      setMships(ms?.data || []);
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setDld(true);
    setLE('');
    try {
      const b = await getPayment(id);
      setDetail(b?.data || null);
      if (!b?.data) setLE('Payment not found');
    } catch (e) {
      setLE(gm(e));
    } finally {
      setDld(false);
    }
  }, [id]);

  useEffect(() => {
    loadSide();
    loadMetrics();
  }, [loadSide, loadMetrics]);

  useEffect(() => {
    if (id) {
      loadDetail();
    } else {
      loadList();
    }
  }, [id, loadList, loadDetail]);

  const refresh = () => {
    setPage(1);
    loadList();
    loadMetrics();
  };

  const closeM = () => setModal(null);
  const closeC = () => setConfirm(null);

  const doCreate = async (f) => {
    setBusy(true);
    try {
      await createPayment({
        user: f.user,
        membership: f.membership,
        amount: Number(f.amount),
        method: f.method,
        status: f.status,
        transactionId: f.txn || undefined,
        paymentDate: f.pdate || undefined,
        notes: f.notes || undefined,
      });
      setNotice('Payment recorded successfully.');
      refresh();
      closeM();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };

  const doUpdate = async (f) => {
    if (!id) return;
    setBusy(true);
    try {
      await updatePayment(id, {
        membership: f.membership || undefined,
        amount: Number(f.amount),
        method: f.method,
        status: f.status,
        transactionId: f.txn || undefined,
        notes: f.notes || undefined,
      });
      setNotice('Payment updated.');
      loadDetail();
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
      await patchPaymentStatus(p._id, s);
      setNotice(`Payment status changed to ${s}.`);
      if (detail?._id === p._id) setDetail((d) => ({ ...d, status: s }));
      refresh();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (p) => {
    setBusy(true);
    try {
      await deletePayment(p._id);
      setNotice('Payment deleted.');
      if (detail?._id === p._id) setDetail(null);
      nav('/owner/payments');
      refresh();
    } catch (e) {
      setNotice(gm(e));
    } finally {
      setBusy(false);
    }
  };

  const openC = () => setModal({ mode: 'create', initial: null });
  const openE = (p) => setModal({ mode: 'edit', initial: p });

  // Detail view
  if (id) {
    return (
      <OwnerLayout title="PAYMENT DETAIL" subtitle={detail ? `Payment #${detail._id.slice(-6)}` : ''}>
        <div className="ft-detail-actions">
          <Link to="/owner/payments" className="ft-btn ft-btn-ghost">← BACK TO PAYMENTS</Link>
          {detail && (
            <>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => openE(detail)}>EDIT</button>
              <select
                value={detail.status}
                onChange={(ev) => doStatus(detail, ev.target.value)}
                disabled={busy}
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 12px' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="ft-btn ft-btn-ghost ft-link-danger" onClick={() => setConfirm({ kind: 'delete', p: detail })}>
                DELETE
              </button>
            </>
          )}
        </div>

        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        {dld ? (
          <div className="ft-members-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ft-skeleton-row" />
            ))}
          </div>
        ) : lE ? (
          <div className="ft-empty">
            <div className="ft-kicker">UNABLE TO LOAD PAYMENT</div>
            <p>{lE}</p>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={loadDetail}>RETRY</button>
          </div>
        ) : detail ? (
          <div className="ft-detail-grid">
            <section className="ft-detail-card ft-detail-wide">
              <div className="ft-kicker">PAYMENT DETAILS</div>
              <dl className="ft-detail-list">
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <P s={detail.status} />
                    <select
                      value={detail.status}
                      onChange={(ev) => doStatus(detail, ev.target.value)}
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
                  <dt>AMOUNT</dt>
                  <dd className="ft-mono" style={{ color: 'var(--white)', fontWeight: 700, fontSize: '18px' }}>
                    ₹{detail.amount != null ? Number(detail.amount).toFixed(2) : '—'}
                  </dd>
                </div>
                <div>
                  <dt>METHOD</dt>
                  <dd className="ft-mono">{(detail.method || '—').replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt>TXN ID</dt>
                  <dd className="ft-mono">{detail.transactionId || '—'}</dd>
                </div>
                <div>
                  <dt>PAYMENT DATE</dt>
                  <dd className="ft-mono">{fmtD(detail.paymentDate)}</dd>
                </div>
                <div>
                  <dt>RECORDED AT</dt>
                  <dd className="ft-mono">{fmtDT(detail.createdAt)}</dd>
                </div>
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
                <div>
                  <dt>EMAIL</dt>
                  <dd className="ft-mono">{detail.user?.email || '—'}</dd>
                </div>
                <div>
                  <dt>PHONE</dt>
                  <dd className="ft-mono">{detail.user?.phone || '—'}</dd>
                </div>
              </dl>
            </section>

            {detail.membership && (
              <section className="ft-detail-card">
                <div className="ft-kicker">LINKED MEMBERSHIP</div>
                <dl className="ft-detail-list">
                  <div>
                    <dt>PLAN</dt>
                    <dd>{detail.membership.plan?.name || detail.membership.plan?.shortName || 'Custom Plan'}</dd>
                  </div>
                  <div>
                    <dt>START DATE</dt>
                    <dd className="ft-mono">{fmtD(detail.membership.startDate)}</dd>
                  </div>
                  <div>
                    <dt>END DATE</dt>
                    <dd className="ft-mono">{fmtD(detail.membership.endDate)}</dd>
                  </div>
                  <div>
                    <dt>PLAN PRICE</dt>
                    <dd className="ft-mono">₹{detail.membership.amount != null ? Number(detail.membership.amount).toFixed(2) : '—'}</dd>
                  </div>
                </dl>
              </section>
            )}

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
          <PaymentFormModal
            open={!!modal}
            mode={modal.mode}
            initial={modal.initial}
            members={members}
            mships={mships}
            busy={busy}
            onClose={closeM}
            onSubmit={modal.mode === 'create' ? doCreate : doUpdate}
          />
        )}

        {confirm && (
          <Confirm
            title={confirm.kind === 'delete' ? 'DELETE PAYMENT' : 'CHANGE STATUS'}
            message={`Delete payment of ₹${Number(confirm.p.amount).toFixed(2)} for ${confirm.p.user?.name}?`}
            label="DELETE"
            warn
            onCancel={closeC}
            onConfirm={() => doDelete(confirm.p)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  // List view
  return (
    <OwnerLayout title="PAYMENT MANAGEMENT" subtitle="Record and track all gym payments">
      {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

      {/* Real metrics */}
      <div className="ft-payments-metrics">
        <div className="ft-stat-card">
          <div className="ft-stat-value">{metrics.total}</div>
          <div className="ft-stat-label">TOTAL PAYMENTS</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-value">{metrics.paid}</div>
          <div className="ft-stat-label">PAID PAYMENTS</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-value">{metrics.pending}</div>
          <div className="ft-stat-label">PENDING PAYMENTS</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-value">₹{metrics.revenue.toFixed(2)}</div>
          <div className="ft-stat-label">REVENUE</div>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="ft-members-toolbar">
        <div className="ft-members-filters" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <select value={memberF} onChange={(e) => { setMemberF(e.target.value); setPage(1); }}>
            <option value="">ALL MEMBERS</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}>
            <option value="">ALL STATUS</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={methodF} onChange={(e) => { setMethodF(e.target.value); setPage(1); }}>
            <option value="">ALL METHODS</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <input
            type="date"
            title="From date"
            value={fromD}
            onChange={(e) => { setFromD(e.target.value); setPage(1); }}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px' }}
          />
          <input
            type="date"
            title="To date"
            value={toD}
            onChange={(e) => { setToD(e.target.value); setPage(1); }}
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px' }}
          />

          <button
            type="button"
            className="ft-btn ft-btn-ghost"
            onClick={() => { setMemberF(''); setStatusF(''); setMethodF(''); setFromD(''); setToD(''); setPage(1); }}
          >
            CLEAR FILTERS
          </button>
        </div>

        <button type="button" className="ft-btn ft-btn-primary" onClick={openC}>
          + RECORD PAYMENT
        </button>
      </div>

      {/* Main Content / Loading / Empty State */}
      {ld ? (
        <div className="ft-members-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ft-skeleton-row" />
          ))}
        </div>
      ) : lE ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD PAYMENTS</div>
          <p>{lE}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={loadList}>RETRY</button>
        </div>
      ) : list.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO PAYMENTS FOUND</div>
          <p>No payment records match the current filters.</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={refresh}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>MEMBERSHIP</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                  <th>STATUS</th>
                  <th>TXN ID</th>
                  <th>PAYMENT DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <Link to={`/owner/members/${p.user?._id || ''}`} className="ft-member-name">
                        {p.user?.name || '—'}
                      </Link>
                    </td>
                    <td>{p.membership?.plan?.name || p.membership?.plan?.shortName || 'Membership'}</td>
                    <td className="ft-mono">₹{p.amount != null ? Number(p.amount).toFixed(2) : '—'}</td>
                    <td className="ft-mono">{(p.method || '—').replace(/_/g, ' ')}</td>
                    <td>
                      <P s={p.status} />
                      <select
                        value={p.status}
                        onChange={(ev) => doStatus(p, ev.target.value)}
                        disabled={busy}
                        style={{ marginLeft: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px' }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="ft-mono" style={{ color: 'var(--text-faint)' }}>{p.transactionId || '—'}</td>
                    <td className="ft-mono">{fmtD(p.paymentDate)}</td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/payments/${p._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link" onClick={() => openE(p)}>EDIT</button>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', p })}>DELETE</button>
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
        <PaymentFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          members={members}
          mships={mships}
          busy={busy}
          onClose={closeM}
          onSubmit={modal.mode === 'create' ? doCreate : doUpdate}
        />
      )}

      {confirm && (
        <Confirm
          title={confirm.kind === 'delete' ? 'DELETE PAYMENT' : 'CHANGE STATUS'}
          message={`Delete payment of ₹${Number(confirm.p.amount).toFixed(2)} for ${confirm.p.user?.name}?`}
          label="DELETE"
          warn
          onCancel={closeC}
          onConfirm={() => doDelete(confirm.p)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
