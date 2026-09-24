import { useAuth } from '../context/AuthContext';
import MemberLayout from '../components/MemberLayout.jsx';
import { fmtD } from '../components/memberFormat.js';
export default function MemberProfile() {
  const { user } = useAuth();
  return (
    <MemberLayout title="MY PROFILE" subtitle="YOUR ACCOUNT DETAILS">
      <div className="ft-detail-grid">
        <section className="ft-detail-card">
          <div className="ft-kicker">PROFILE</div>
          <dl className="ft-detail-list">
            <div><dt>NAME</dt><dd style={{ color: 'var(--white)', fontWeight: 700 }}>{user?.name || 'â€”'}</dd></div>
            <div><dt>EMAIL</dt><dd className="ft-mono">{user?.email || 'â€”'}</dd></div>
            <div><dt>PHONE</dt><dd className="ft-mono">{user?.phone || 'â€”'}</dd></div>
            <div><dt>ROLE</dt><dd className="ft-mono">{user?.role || 'â€”'}</dd></div>
          </dl>
        </section>
        <section className="ft-detail-card">
          <div className="ft-kicker">ACCOUNT</div>
          <dl className="ft-detail-list">
            <div><dt>STATUS</dt><dd><span className={`ft-pill ${user?.isActive ? 'ft-pill-active' : 'ft-pill-inactive'}`}>{user?.isActive ? 'ACTIVE' : 'INACTIVE'}</span></dd></div>
            <div><dt>JOINED</dt><dd className="ft-mono">{fmtD(user?.createdAt)}</dd></div>
            <div><dt>AVATAR</dt><dd className="ft-mono">{user?.avatar || 'â€”'}</dd></div>
          </dl>
          <p className="ft-form-note" style={{ marginTop: 16 }}>Profile changes are managed by the gym owner. Contact the gym to update your details.</p>
        </section>
      </div>
    </MemberLayout>
  );
}
