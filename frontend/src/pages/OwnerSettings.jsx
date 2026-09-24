import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getSettings, updateSettings } from '../services/settingsService';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function gm(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong';
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'website', label: 'Website' },
];

export default function OwnerSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState(null);

  const [form, setForm] = useState({
    gymName: '', address: '', phone: '', email: '', description: '', logo: '',
  });
  const [hours, setHours] = useState(
    DAYS.map(() => ({ open: '', close: '', isClosed: false }))
  );
  const [socials, setSocials] = useState(
    SOCIAL_PLATFORMS.map(() => ({ url: '' }))
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setLoadError(''); setSaveError('');
      try {
        const body = await getSettings();
        const s = body?.data;
        if (cancelled) return;
        setSettings(s);
        if (s) {
          setForm({
            gymName: s.gymName || '', address: s.address || '',
            phone: s.phone || '', email: s.email || '',
            description: s.description || '', logo: s.logo || '',
          });
          setHours(s.hours ? s.hours.map(h => ({
            open: h.open || '', close: h.close || '', isClosed: !!h.isClosed,
          })) : DAYS.map(() => ({ open: '', close: '', isClosed: false })));
          setSocials(SOCIAL_PLATFORMS.map(p => ({
            url: (s.socialLinks && s.socialLinks[p.key]) || '',
          })));
        }
      } catch (err) {
        if (!cancelled) setLoadError(gm(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(''); setSaveLoading(true);
    try {
      await updateSettings({
        gymName: form.gymName, address: form.address, phone: form.phone,
        email: form.email, description: form.description, logo: form.logo,
        hours: hours.map(h => ({ open: h.open, close: h.close, isClosed: h.isClosed })),
        socialLinks: Object.fromEntries(
          SOCIAL_PLATFORMS.map((p, i) => [p.key, socials[i]?.url || ''])
        ),
      });
      setNotice('Settings saved successfully.');
      setSaveLoading(false);
    } catch (err) {
      setSaveError(gm(err));
      setSaveLoading(false);
    }
  };

  const updateHour = (i, key, value) => {
    setHours(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const updateSocial = (i, url) => {
    setSocials(prev => {
      const next = [...prev];
      next[i] = { url };
      return next;
    });
  };

  return (
    <OwnerLayout title='GYM SETTINGS' subtitle={settings ? 'Manage gym configuration' : ''}>
      <div className='ft-detail-actions'>
        {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}
        {saveError && <div className='ft-alert ft-alert-error'>{saveError}</div>}
      </div>

      {loading ? (
        <div className='ft-members-skeleton'>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}
        </div>
      ) : loadError ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>UNABLE TO LOAD SETTINGS</div>
          <p>{loadError}</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setLoading(true)}>RETRY</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className='ft-form'>
          <div className='ft-section-head'>
            <h2>General Settings</h2>
          </div>

          <div className='ft-form-grid'>
            <div className='ft-field'>
              <span>Gym Name</span>
              <input
                type='text'
                value={form.gymName}
                onChange={e => setForm(f => ({ ...f, gymName: e.target.value }))}
                placeholder='FitTrack Gym'
              />
            </div>
            <div className='ft-field'>
              <span>Contact Phone</span>
              <input
                type='text'
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder='+91 98765 43210'
              />
            </div>
            <div className='ft-field'>
              <span>Email</span>
              <input
                type='email'
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder='hello@fittrack.com'
              />
            </div>
            <div className='ft-field'>
              <span>Logo URL</span>
              <input
                type='url'
                value={form.logo}
                onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
                placeholder='https://...'
              />
              <span className='ft-field-hint'>Optional — public URL to your gym logo</span>
            </div>
          </div>

          <div className='ft-field' style={{ marginTop: 20 }}>
            <span>Address</span>
            <textarea
              rows={3}
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder='123 Fitness Street, City, State — 123456'
            />
          </div>

          <div className='ft-field'>
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder='About your gym...'
            />
          </div>

          <div className='ft-section-head'>
            <h2>Gym Hours</h2>
          </div>

          <div className='ft-form-grid' style={{ marginBottom: 16 }}>
            {DAYS.map((day, i) => (
              <div key={day} className='ft-field' style={{ borderLeft: '3px solid var(--lime)', paddingLeft: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', textTransform: 'uppercase', color: 'var(--white)' }}>{day}</span>
                  <label className='ft-check' style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    <input
                      type='checkbox'
                      checked={hours[i].isClosed}
                      onChange={e => updateHour(i, 'isClosed', e.target.checked)}
                    />
                    Closed
                  </label>
                </div>
                {!hours[i].isClosed && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type='time'
                      value={hours[i].open}
                      onChange={e => updateHour(i, 'open', e.target.value)}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                    />
                    <span style={{ color: 'var(--text-faint)', fontSize: '14px' }}>to</span>
                    <input
                      type='time'
                      value={hours[i].close}
                      onChange={e => updateHour(i, 'close', e.target.value)}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='ft-section-head'>
            <h2>Social Links</h2>
          </div>

          <div className='ft-form-grid'>
            {SOCIAL_PLATFORMS.map((platform, i) => (
              <div key={platform.key} className='ft-field'>
                <span>{platform.label}</span>
                <input
                  type='url'
                  value={socials[i]?.url || ''}
                  onChange={e => updateSocial(i, e.target.value)}
                  placeholder={`https://${platform.key}.com/yourpage`}
                />
              </div>
            ))}
          </div>

          <div className='ft-modal-actions' style={{ marginTop: 24 }}>
            <button type='button' className='ft-btn ft-btn-ghost' onClick={() => { setLoadError(''); }}>RELOAD</button>
            <button
              type='submit'
              className='ft-btn ft-btn-primary'
              disabled={saveLoading}
            >
              {saveLoading ? 'SAVING…' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      )}
    </OwnerLayout>
  );
}
