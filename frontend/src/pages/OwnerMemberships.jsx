import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listMemberships,
  createMembership,
  updateMembership,
  patchMembershipStatus,
  listMembershipPlans,
  manageMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  patchMembershipPlanStatus,
  deleteMembershipPlan,
} from '../services/membershipService';
import { listMembers } from '../services/memberService';

const LIMIT = 10;
const MEMBERSHIP_STATUSES = ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'];

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'
  );
}

const STATUS_META = {
  PENDING: 'ft-pill-pending',
  ACTIVE: 'ft-pill-active',
  EXPIRED: 'ft-pill-expired',
  CANCELLED: 'ft-pill-cancelled',
};

function StatusPill({ status }) {
  return <span className={`ft-pill ${STATUS_META[status] || 'ft-pill-inactive'}`}>{status || '—'}</span>;
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

function MembershipFormModal({ open, mode, initial, plans, members, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({ member: '', plan: '', startDate: '', price: '', status: 'PENDING' }));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      member: initial?.member?._id || initial?.member || '',
      plan: initial?.plan?._id || initial?.plan || '',
      startDate: initial?.startDate ? String(initial.startDate).slice(0, 10) : '',
      price: initial?.price != null ? String(initial.price) : '',
      status: initial?.status || 'PENDING',
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.plan) return setError('Plan is required');
    if (mode === 'create' && !form.member) return setError('Member is required');
    onSubmit(form);
  };

  return (
    <div className="ft-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="ft-modal" role="dialog" aria-modal="true">
        <div className="ft-modal-header">
          <h3>{mode === 'create' ? 'New Membership' : 'Edit Membership'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy} aria-label="Close">✕</button>
        </div>
        {error && <div className="ft-alert ft-alert-error">{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <label className="ft-field">
            <span>Member *</span>
            {mode === 'create' ? (
              <select value={form.member} onChange={set('member')} required>
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}{m.email ? ` — ${m.email}` : ''}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={initial?.member?.user?.name || initial?.member?.name || '—'} disabled />
            )}
          </label>
          <label className="ft-field">
            <span>Plan *</span>
            <select value={form.plan} onChange={set('plan')} required>
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="ft-field">
            <span>Start date</span>
            <input type="date" value={form.startDate} onChange={set('startDate')} />
          </label>
          <label className="ft-field">
            <span>Price (override)</span>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="Use plan price" />
          </label>
          <label className="ft-field">
            <span>Status</span>
            <select value={form.status} onChange={set('status')}>
              {MEMBERSHIP_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create membership' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlanFormModal({ open, mode, initial, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: '', shortName: '', durationMonths: '1', price: '', billingLabel: '',
    billingNote: '', description: '', features: '', popular: false, featured: false, badge: '',
  }));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      name: initial?.name || '',
      shortName: initial?.shortName || '',
      durationMonths: initial?.durationMonths != null ? String(initial.durationMonths) : '1',
      price: initial?.price != null ? String(initial.price) : '',
      billingLabel: initial?.billingLabel || '',
      billingNote: initial?.billingNote || '',
      description: initial?.description || '',
      features: Array.isArray(initial?.features) ? initial.features.join('\n') : (initial?.features || ''),
      popular: !!initial?.popular,
      featured: !!initial?.featured,
      badge: initial?.badge || '',
    });
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    const duration = Number(form.durationMonths);
    if (!Number.isInteger(duration) || duration < 1) return setError('Duration must be a whole number ≥ 1');
    if (form.price === '' || Number(form.price) < 0) return setError('Price must be 0 or greater');
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      durationMonths: duration,
      price: Number(form.price),
      billingLabel: form.billingLabel.trim(),
      billingNote: form.billingNote.trim(),
      description: form.description.trim(),
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      popular: !!form.popular,
      featured: !!form.featured,
      badge: form.badge.trim(),
    };
    onSubmit(payload);
  };

  return (
    <div className="ft-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="ft-modal ft-modal-lg" role="dialog" aria-modal="true">
        <div className="ft-modal-header">
          <h3>{mode === 'create' ? 'New Plan' : 'Edit Plan'}</h3>
          <button type="button" className="ft-icon-btn" onClick={onClose} disabled={busy} aria-label="Close">✕</button>
        </div>
        {error && <div className="ft-alert ft-alert-error">{error}</div>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-form-grid">
            <label className="ft-field">
              <span>Name *</span>
              <input type="text" value={form.name} onChange={set('name')} required />
            </label>
            <label className="ft-field">
              <span>Short name</span>
              <input type="text" value={form.shortName} onChange={set('shortName')} />
            </label>
            <label className="ft-field">
              <span>Duration (months) *</span>
              <input type="number" min="1" step="1" value={form.durationMonths} onChange={set('durationMonths')} required />
            </label>
            <label className="ft-field">
              <span>Price *</span>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
            </label>
            <label className="ft-field">
              <span>Billing label</span>
              <input type="text" value={form.billingLabel} onChange={set('billingLabel')} placeholder="per month" />
            </label>
            <label className="ft-field">
              <span>Badge</span>
              <input type="text" value={form.badge} onChange={set('badge')} placeholder="MOST POPULAR" />
            </label>
          </div>
          <label className="ft-field">
            <span>Billing note</span>
            <input type="text" value={form.billingNote} onChange={set('billingNote')} />
          </label>
          <label className="ft-field">
            <span>Description</span>
            <textarea value={form.description} onChange={set('description')} rows={2} />
          </label>
          <label className="ft-field">
            <span>Features (one per line)</span>
            <textarea value={form.features} onChange={set('features')} rows={3} />
          </label>
          <div className="ft-check-row">
            <label className="ft-check">
              <input type="checkbox" checked={form.popular} onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))} />
              <span>Popular</span>
            </label>
            <label className="ft-check">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              <span>Featured</span>
            </label>
          </div>
          <div className="ft-modal-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create plan' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function OwnerMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, expired: 0, plans: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { mode, initial }
  const [planModal, setPlanModal] = useState(null); // { mode, initial }
  const [confirm, setConfirm] = useState(null); // { kind, id, name }
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, p, allPlans] = await Promise.all([
        listMemberships({ status: statusFilter, page, limit: LIMIT }),
        listMembers({ limit: 100 }),
        manageMembershipPlans({ limit: 100 }),
      ]);
      setMemberships(m?.data || []);
      setPages(m?.meta?.pages || 1);
      setMembers(p?.data || []);
      const planList = allPlans?.data || [];
      setPlans(planList);
      const s = { total: m?.meta?.total || 0, active: 0, pending: 0, expired: 0, plans: planList.length };
      for (const row of m?.data || []) {
        if (row.status === 'ACTIVE') s.active += 1;
        else if (row.status === 'PENDING') s.pending += 1;
        else if (row.status === 'EXPIRED') s.expired += 1;
      }
      setStats(s);
    } catch (err) {
      setNotice({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const flash = (type, text) => setNotice({ type, text });

  const submitMembership = async (form) => {
    setBusy(true);
    try {
      if (modal?.mode === 'create') {
        await createMembership({
          user: form.member,
          plan: form.plan,
          startDate: form.startDate || undefined,
          amount: form.price !== '' ? Number(form.price) : undefined,
        });
        flash('ok', 'Membership assigned.');
      } else {
        const payload = { status: form.status };
        if (form.price !== '') payload.amount = Number(form.price);
        if (form.startDate) payload.startDate = form.startDate;
        await updateMembership(modal.initial._id, payload);
        flash('ok', 'Membership updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      flash('error', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitPlan = async (payload) => {
    setBusy(true);
    try {
      if (planModal?.mode === 'create') {
        await createMembershipPlan(payload);
        flash('ok', 'Plan created.');
      } else {
        await updateMembershipPlan(planModal.initial._id, payload);
        flash('ok', 'Plan updated.');
      }
      setPlanModal(null);
      load();
    } catch (err) {
      flash('error', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const changePlanStatus = async (plan) => {
    setConfirm(null);
    setBusy(true);
    try {
      await patchMembershipPlanStatus(plan._id, !plan.isActive);
      flash('ok', `Plan "${plan.name}" ${plan.isActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err) {
      flash('error', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deletePlan = async (plan) => {
    setConfirm(null);
    setBusy(true);
    try {
      await deleteMembershipPlan(plan._id);
      flash('ok', `Plan "${plan.name}" deleted.`);
      load();
    } catch (err) {
      flash('error', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const changeMembershipStatus = async (m, status) => {
    setBusy(true);
    try {
      await patchMembershipStatus(m._id, status);
      flash('ok', `Membership → ${status}.`);
      load();
    } catch (err) {
      flash('error', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const filtered = memberships.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const memberName = (m.user?.name || '').toLowerCase();
    const memberEmail = (m.user?.email || '').toLowerCase();
    const planName = (m.plan?.name || '').toLowerCase();
    return memberName.includes(q) || memberEmail.includes(q) || planName.includes(q);
  });

  return (
    <OwnerLayout title="MEMBERSHIPS" subtitle="MANAGE PLANS. TRACK ACTIVE COMMITMENTS.">
      {notice && (
        <div className={`ft-banner ${notice.type === 'ok' ? 'ft-banner-ok' : 'ft-banner-error'}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="ft-stats">
        <StatCard label="TOTAL MEMBERSHIPS" value={stats.total} />
        <StatCard label="ACTIVE" value={stats.active} />
        <StatCard label="PENDING" value={stats.pending} />
        <StatCard label="EXPIRED" value={stats.expired} />
        <StatCard label="AVAILABLE PLANS" value={stats.plans} />
      </div>

      <div className="ft-toolbar">
        <div className="ft-search">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member or plan"
            aria-label="Search memberships"
          />
          {search && (
            <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setSearch('')}>CLEAR</button>
          )}
        </div>
        <div className="ft-filters">
          <label className="ft-sr-only" htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">ALL STATUS</option>
            {MEMBERSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="ft-btn ft-btn-primary" onClick={() => setModal({ mode: 'create' })}>
            + ASSIGN MEMBERSHIP
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ft-skeleton-grid" aria-label="Loading memberships">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="ft-skeleton-row" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO MEMBERSHIPS FOUND</div>
          <p>{search || statusFilter ? 'Try a different search or clear your filters.' : 'Assign your first membership to get started.'}</p>
        </div>
      ) : (
        <>
          <div className="ft-table-wrap">
            <table className="ft-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>PLAN</th>
                  <th>START</th>
                  <th>END</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <Link to={`/owner/memberships/${m._id}`} className="ft-member-name">{m.user?.name || '—'}</Link>
                      <div className="ft-mono">{m.user?.email || ''}</div>
                    </td>
                    <td>{m.plan?.name || '—'}</td>
                    <td className="ft-mono">{fmtDate(m.startDate)}</td>
                    <td className="ft-mono">{fmtDate(m.endDate)}</td>
                    <td className="ft-mono">{m.amount != null ? m.amount : '—'}</td>
                    <td><StatusPill status={m.status} /></td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/memberships/${m._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link" onClick={() => setModal({ mode: 'edit', initial: m })}>EDIT</button>
                        <select
                          className="ft-inline-select"
                          value={m.status}
                          onChange={(e) => changeMembershipStatus(m, e.target.value)}
                          aria-label="Change status"
                        >
                          {MEMBERSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ft-pagination">
            <span className="ft-pagination-info">PAGE {page} OF {pages || 1} · TOTAL {stats.total}</span>
            <div className="ft-pagination-btns">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      <div className="ft-section-head">
        <h2>MEMBERSHIP PLANS</h2>
        <button type="button" className="ft-btn ft-btn-primary" onClick={() => setPlanModal({ mode: 'create' })}>+ CREATE PLAN</button>
      </div>

      {plans.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">NO MEMBERSHIP PLANS FOUND</div>
          <p>Create your first plan to start assigning memberships.</p>
        </div>
      ) : (
        <div className="ft-table-wrap">
          <table className="ft-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>SHORT</th>
                <th>DURATION</th>
                <th>PRICE</th>
                <th>BILLING</th>
                <th>FLAGS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td className="ft-mono">{p.shortName || '—'}</td>
                  <td className="ft-mono">{p.durationMonths} mo</td>
                  <td className="ft-mono">{p.price}</td>
                  <td className="ft-mono">{p.billingLabel || '—'}</td>
                  <td className="ft-mono">{p.popular ? 'POPULAR ' : ''}{p.featured ? 'FEATURED' : ''}</td>
                  <td><ActivePill active={p.isActive} /></td>
                  <td>
                    <div className="ft-row-actions">
                      <button type="button" className="ft-link" onClick={() => setPlanModal({ mode: 'edit', initial: p })}>EDIT</button>
                      <button type="button" className="ft-link" onClick={() => setConfirm({ kind: 'plan-status', id: p._id, name: p.name, isActive: p.isActive })}>
                        {p.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                      <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'plan-delete', id: p._id, name: p.name })}>DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MembershipFormModal
          open={!!modal}
          mode={modal.mode}
          initial={modal.initial}
          plans={plans}
          members={members}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={submitMembership}
        />
      )}

      {planModal && (
        <PlanFormModal
          open={!!planModal}
          mode={planModal.mode}
          initial={planModal.initial}
          busy={busy}
          onClose={() => setPlanModal(null)}
          onSubmit={submitPlan}
        />
      )}

      {confirm && (
        <div className="ft-modal-overlay" role="alertdialog" aria-modal="true">
          <div className="ft-modal ft-modal-sm">
            <div className="ft-modal-header">
              <h3>{confirm.kind === 'plan-delete' ? 'DELETE PLAN' : confirm.isActive ? 'DEACTIVATE PLAN' : 'ACTIVATE PLAN'}</h3>
              <button type="button" className="ft-icon-btn" onClick={() => setConfirm(null)} aria-label="Close">✕</button>
            </div>
            <p className="ft-confirm-msg">
              {confirm.kind === 'plan-delete'
                ? `Delete plan "${confirm.name}"? This soft-deletes it (hidden from members).`
                : confirm.isActive
                  ? `Deactivate plan "${confirm.name}"? It will no longer be available for new memberships.`
                  : `Activate plan "${confirm.name}"? It will become available again.`}
            </p>
            <div className="ft-modal-actions">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={() => setConfirm(null)}>CANCEL</button>
                            <button type="button" className="ft-btn ft-btn-primary" onClick={() => {
                const plan = { _id: confirm.id, name: confirm.name, isActive: confirm.isActive };
                if (confirm.kind === 'plan-delete') deletePlan(plan);
                else changePlanStatus(plan);
              }}>
                {confirm.kind === 'plan-delete' ? 'DELETE' : confirm.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}

