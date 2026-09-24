import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getMember, setMemberStatus, deleteMember } from '../services/memberService';

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

export default function OwnerMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const body = await getMember(id);
      setMember(body?.data || null);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async () => {
    if (!member || busy) return;
    setBusy(true);
    try {
      const body = await setMemberStatus(member._id, !member.isActive);
      setMember(body?.data || member);
      setNotice(`${member.name} ${member.isActive ? 'deactivated' : 'activated'}.`);
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!member || busy) return;
    const ok = window.confirm(`Delete ${member.name}? Their account will be soft-deleted and cannot log in.`);
    if (!ok) return;
    setBusy(true);
    try {
      await deleteMember(member._id);
      setNotice('Member deleted. Returning to list…');
      setTimeout(() => {
        navigate('/owner/members');
      }, 1200);
    } catch (err) {
      setNotice(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <OwnerLayout title="MEMBER DETAIL" subtitle={member ? member.name : 'LOADING…'}>
      <div className="ft-detail-actions">
        <Link to="/owner/members" className="ft-btn ft-btn-ghost">← BACK TO MEMBERS</Link>
        {member && (
          <>
            <button type="button" className="ft-btn ft-btn-ghost" onClick={handleStatus} disabled={busy}>
              {member.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
            <button type="button" className="ft-btn ft-btn-primary" onClick={handleDelete} disabled={busy}>
              DELETE
            </button>
          </>
        )}
      </div>

      {notice && (
        <div className={`ft-banner ${String(notice).toLowerCase().includes('deleted') ? 'ft-banner-ok' : 'ft-banner-ok'}`} role="status">
          {notice}
        </div>
      )}

      {loadError && !loading ? (
        <div className="ft-empty">
          <div className="ft-kicker">UNABLE TO LOAD MEMBER</div>
          <p>{loadError}</p>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={load}>RETRY</button>
        </div>
      ) : loading ? (
        <div className="ft-members-skeleton" aria-label="Loading member">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ft-skeleton-row" />
          ))}
        </div>
      ) : member ? (
        <div className="ft-detail-grid">
          <section className="ft-detail-card">
            <div className="ft-kicker">PROFILE</div>
            <dl className="ft-detail-list">
              <div><dt>NAME</dt><dd>{member.name}</dd></div>
              <div><dt>EMAIL</dt><dd className="ft-mono">{member.email}</dd></div>
              <div><dt>PHONE</dt><dd className="ft-mono">{member.phone || '—'}</dd></div>
              <div><dt>ROLE</dt><dd className="ft-mono">{member.role}</dd></div>
            </dl>
          </section>

          <section className="ft-detail-card">
            <div className="ft-kicker">ACCOUNT</div>
            <dl className="ft-detail-list">
              <div>
                <dt>STATUS</dt>
                <dd>
                  <span className={`ft-pill ${member.isActive ? 'ft-pill-active' : 'ft-pill-inactive'}`}>
                    {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </dd>
              </div>
              <div><dt>JOINED</dt><dd className="ft-mono">{fmtDate(member.createdAt)}</dd></div>
              <div><dt>LAST UPDATED</dt><dd className="ft-mono">{fmtDate(member.updatedAt)}</dd></div>
              <div><dt>MEMBER ID</dt><dd className="ft-mono ft-id">{member._id}</dd></div>
            </dl>
          </section>
        </div>
      ) : null}
    </OwnerLayout>
  );
}