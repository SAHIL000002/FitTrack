import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import {
  listMembers,
  createMember,
  updateMember,
  setMemberStatus,
  deleteMember,
} from '../services/memberService';

const LIMIT = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function Pill({ active }) {
  return <span className={`ft-pill ${active ? 'ft-pill-active' : 'ft-pill-inactive'}`}>{active ? 'ACTIVE' : 'INACTIVE'}</span>;
}
/** Inline form modal used for ADD and EDIT. */
function MemberFormModal({ mode, member, onClose, onSaved }) {
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (mode === 'add') {
      if (!email.trim()) return 'Email is required.';
      if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
      if (!password) return 'Password is required.';
      if (password.length < 8) return 'Password must be at least 8 characters.';
      if (password !== confirm) return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const v = validate();
    setFieldError(v || '');
    setApiError('');
    if (v) return;

    setSaving(true);
    try {
      if (mode === 'add') {
        await createMember({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password });
      } else {
        await updateMember(member._id, { name: name.trim(), phone: phone.trim() });
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ft-modal-overlay" role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Add member' : 'Edit member'}>
      <div className="ft-modal">
        <div className="ft-modal-head">
          <h3>{mode === 'add' ? 'ADD MEMBER' : 'EDIT MEMBER'}</h3>
          <button type="button" className="ft-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ft-field">
            <label htmlFor="mm-name">NAME</label>
            <input id="mm-name" ref={nameRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Member name" disabled={saving} />
          </div>
{mode === 'add' ? (
            <>
              <div className="ft-field">
                <label htmlFor="mm-email">EMAIL</label>
                <input id="mm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@fittrack.test" disabled={saving} />
              </div>
              <div className="ft-field">
                <label htmlFor="mm-password">PASSWORD</label>
                <input id="mm-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" disabled={saving} autoComplete="new-password" />
              </div>
              <div className="ft-field">
                <label htmlFor="mm-confirm">CONFIRM PASSWORD</label>
                <input id="mm-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" disabled={saving} autoComplete="new-password" />
              </div>
            </>
          ) : (
            <>
              <div className="ft-field">
                <label htmlFor="mm-email">EMAIL</label>
                <input id="mm-email" type="text" value={email} disabled aria-disabled="true" />
                <span className="ft-field-hint">Email cannot be changed.</span>
              </div>
              <div className="ft-field">
                <label htmlFor="mm-password">PASSWORD</label>
                <input id="mm-password" type="text" value="••••••••" disabled aria-disabled="true" />
                <span className="ft-field-hint">Passwords are managed by the member at login.</span>
              </div>
            </>
          )}

          <div className="ft-field">
            <label htmlFor="mm-phone">PHONE <span className="ft-optional">(OPTIONAL)</span></label>
            <input id="mm-phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" disabled={saving} />
          </div>

          {fieldError && <p className="ft-field-error" role="alert">{fieldError}</p>}
          {apiError && <p className="ft-field-error" role="alert">{apiError}</p>}

          <div className="ft-form-actions">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose} disabled={saving}>CANCEL</button>
            <button type="submit" className="ft-btn ft-btn-primary" disabled={saving}>
              {saving ? (mode === 'add' ? 'ADDING…' : 'SAVING…') : (mode === 'add' ? 'ADD MEMBER' : 'SAVE CHANGES')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Confirm dialog for destructive / deactivation actions. */
function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="ft-modal-overlay" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="ft-modal ft-modal-sm">
        <div className="ft-modal-head">
          <h3>{title}</h3>
          <button type="button" className="ft-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <p className="ft-confirm-msg">{message}</p>
        <div className="ft-form-actions">
          <button type="button" className="ft-btn ft-btn-ghost" onClick={onCancel}>CANCEL</button>
          <button type="button" className="ft-btn ft-btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerMembers() {
  const [members, setMembers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: LIMIT, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [form, setForm] = useState(null); // { mode: 'add' } | { mode: 'edit', member }
  const [confirm, setConfirm] = useState(null); // { kind, member }
  const [banner, setBanner] = useState(null); // { type: 'ok'|'error', text }

  const hasFilters = Boolean(search || role || status);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await listMembers({ search, role, status, page, limit: LIMIT });
      setMembers(body?.data || []);
      setMeta(body?.meta || { page: 1, limit: LIMIT, total: 0, pages: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err));
      setMembers([]);
      setMeta((m) => ({ ...m, total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!banner) return undefined;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const showBanner = (type, text) => setBanner({ type, text });

  const handleStatusAction = async (member, nextActive) => {
    setConfirm(null);
    setMutating(true);
    try {
      await setMemberStatus(member._id, nextActive);
      showBanner('ok', `${member.name} ${nextActive ? 'activated' : 'deactivated'}.`);
      load();
    } catch (err) {
      showBanner('error', getErrorMessage(err));
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (member) => {
    setConfirm(null);
    setMutating(true);
    try {
      await deleteMember(member._id);
      showBanner('ok', `${member.name} was deleted.`);
      load();
    } catch (err) {
      showBanner('error', getErrorMessage(err));
    } finally {
      setMutating(false);
    }
  };

  const nextPage = () => {
    if (page < meta.pages) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };
return (
    <OwnerLayout title="MEMBERS" subtitle="MANAGE YOUR MEMBERS. TRACK THEIR JOURNEY.">
      {banner && (
        <div className={`ft-banner ${banner.type === 'ok' ? 'ft-banner-ok' : 'ft-banner-error'}`} role="status">
          {banner.text}
        </div>
      )}

      <div className="ft-members-toolbar">
        <form className="ft-search" onSubmit={handleSearch}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone"
            aria-label="Search members"
          />
          <button type="submit" className="ft-btn ft-btn-primary ft-search-btn">SEARCH</button>
          {search && (
            <button type="button" className="ft-btn ft-btn-ghost" onClick={handleClearSearch}>CLEAR</button>
          )}
        </form>

        <div className="ft-members-filters">
          <label className="ft-sr-only" htmlFor="filter-role">Role</label>
          <select id="filter-role" value={role} onChange={handleRoleChange} aria-label="Filter by role">
            <option value="">ALL ROLES</option>
            <option value="MEMBER">MEMBER</option>
            <option value="OWNER">OWNER</option>
          </select>

          <label className="ft-sr-only" htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={handleStatusChange} aria-label="Filter by status">
            <option value="">ALL STATUS</option>
            <option value="active">ACTIVE</option>
            <option value="inactive">INACTIVE</option>
          </select>

          <button type="button" className="ft-btn ft-btn-primary" onClick={() => setForm({ mode: 'add' })}>
            + ADD MEMBER
          </button>
        </div>
      </div>

      {loadError && !loading ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD MEMBERS</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={load}>RETRY</button>
        </div>
      ) : loading ? (
        <div className="ft-members-skeleton" aria-label="Loading members">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="ft-skeleton-row" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-kicker">{hasFilters ? 'NO MEMBERS MATCH YOUR FILTERS' : 'NO MEMBERS FOUND'}</div>
          <p>{hasFilters ? 'Try a different search or clear your filters.' : 'Add your first member to get started.'}</p>
        </div>
      ) : (
        <>
          <div className="ft-members-table-wrap">
            <table className="ft-members-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td><Link to={`/owner/members/${m._id}`} className="ft-member-name">{m.name}</Link></td>
                    <td className="ft-mono">{m.email}</td>
                    <td className="ft-mono">{m.phone || '—'}</td>
                    <td className="ft-mono">{m.role}</td>
                    <td><Pill active={m.isActive} /></td>
                    <td className="ft-mono">{fmtDate(m.createdAt)}</td>
                    <td>
                      <div className="ft-row-actions">
                        <Link to={`/owner/members/${m._id}`} className="ft-link">VIEW</Link>
                        <button type="button" className="ft-link" onClick={() => setForm({ mode: 'edit', member: m })}>EDIT</button>
                        <button
                          type="button"
                          className="ft-link"
                          onClick={() => setConfirm(m.isActive ? { kind: 'deactivate', member: m } : { kind: 'activate', member: m })}
                        >
                          {m.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                        <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', member: m })}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
<ul className="ft-members-cards">
            {members.map((m) => (
              <li key={m._id} className="ft-member-card">
                <div className="ft-member-card-top">
                  <Link to={`/owner/members/${m._id}`} className="ft-member-name">{m.name}</Link>
                  <Pill active={m.isActive} />
                </div>
                <div className="ft-mono">{m.email}</div>
                <div className="ft-mono">{m.phone || '—'} · {m.role} · joined {fmtDate(m.createdAt)}</div>
                <div className="ft-row-actions">
                  <Link to={`/owner/members/${m._id}`} className="ft-link">VIEW</Link>
                  <button type="button" className="ft-link" onClick={() => setForm({ mode: 'edit', member: m })}>EDIT</button>
                  <button type="button" className="ft-link" onClick={() => setConfirm(m.isActive ? { kind: 'deactivate', member: m } : { kind: 'activate', member: m })}>
                    {m.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                  <button type="button" className="ft-link ft-link-danger" onClick={() => setConfirm({ kind: 'delete', member: m })}>DELETE</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="ft-pagination">
            <span className="ft-pagination-info">PAGE {meta.page} OF {meta.pages || 0} · TOTAL {meta.total}</span>
            <div className="ft-pagination-btns">
              <button type="button" className="ft-btn ft-btn-ghost" onClick={prevPage} disabled={page <= 1}>PREVIOUS</button>
              <button type="button" className="ft-btn ft-btn-ghost" onClick={nextPage} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      {form && (
        <MemberFormModal
          mode={form.mode}
          member={form.member}
          onClose={() => setForm(null)}
          onSaved={() => showBanner('ok', form.mode === 'add' ? 'Member added.' : 'Member updated.')}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'delete' ? 'DELETE MEMBER' : confirm.kind === 'deactivate' ? 'DEACTIVATE MEMBER' : 'ACTIVATE MEMBER'}
          message={
            confirm.kind === 'delete'
              ? `This will delete ${confirm.member.name}. Their account is soft-deleted and cannot log in. Continue?`
              : confirm.kind === 'deactivate'
                ? `Deactivate ${confirm.member.name}? They will no longer be able to log in until reactivated.`
                : `Activate ${confirm.member.name}?`
          }
          confirmLabel={confirm.kind === 'delete' ? 'DELETE' : confirm.kind === 'deactivate' ? 'DEACTIVATE' : 'ACTIVATE'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.kind === 'delete') handleDelete(confirm.member);
            else handleStatusAction(confirm.member, confirm.kind === 'activate');
          }}
        />
      )}
    </OwnerLayout>
  );
}