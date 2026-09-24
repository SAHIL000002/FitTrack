import { Link } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { CONTACT_INFO, ENQUIRY_TYPES, PREFERRED_CONTACTS, EMPTY_ENQUIRY, CONTACT_REASONS, CONTACT_FAQS } from '../data/contactData.js';
import { createEnquiry } from '../services/enquiryService';

const HERO_BG = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format&fit=crop';
const CTA_BG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Backend enums (backend/src/services/enquiryConstants.js) differ from the
// display labels used on the public site — map labels to API values on submit.
const TYPE_MAP = {
  Membership: 'MEMBERSHIP',
  'Personal Training': 'PERSONAL_TRAINING',
  Programs: 'PROGRAMS',
  'General Question': 'GENERAL_QUESTION',
};
const CONTACT_MAP = { Email: 'EMAIL', Phone: 'PHONE' };

function FieldError({ id, message }) {
  if (!message) return null;
  return <p className="ft-field-error" id={id} role="alert">{message}</p>;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_ENQUIRY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | ready | error
  const [serverError, setServerError] = useState('');
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (name.length < 2) next.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(email)) next.email = 'Please enter a valid email address.';
    if (form.phone.trim() && form.phone.trim().length < 7) next.phone = 'Enter a valid phone or leave it blank.';
    if (!TYPE_MAP[form.enquiryType]) next.enquiryType = 'Please choose an enquiry type.';
    if (message.length < 10) next.message = 'Tell us a little more (min 10 characters).';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStatus('sending');
    setServerError('');
    try {
      await createEnquiry({
        name,
        email,
        phone: form.phone.trim(),
        enquiryType: TYPE_MAP[form.enquiryType],
        preferredContact: CONTACT_MAP[form.preferredContact] || undefined,
        message,
      });
      setStatus('ready');
    } catch (err) {
      // Never expose raw server internals — show the clean API message if present.
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setServerError(msg);
      setStatus('error');
    }
  };
  const resetDemo = () => { setForm(EMPTY_ENQUIRY); setErrors({}); setServerError(''); setStatus('idle'); };
  return (
    <>
      <main>
        <PageHero eyebrow="FIT TRACK / CONTACT" title="LET'S TALK TRAINING."
          lead="Questions about membership, coaching, programs, or the gym? Tell us what you need and we'll take it from there."
          bg={HERO_BG} />
        <section className="ft-section surface" id="info">
          <div className="ft-container">
            <SectionHeading kicker="Contact Information" title="FIND FIT TRACK."
              lead="Visit, call, or write — start with whatever is easiest for you." />
            <div className="ft-contact-split">
              <Reveal>
                <div className="ft-contact-info">
                  <div className="ft-info-block">
                    <div className="ft-kicker">Location</div>
                    <h3>{CONTACT_INFO.locationTitle}</h3>
                    {CONTACT_INFO.locationLines.map((l) => (<p key={l}>{l}</p>))}
                  </div>
                  <div className="ft-info-block">
                    <div className="ft-kicker">Hours · {CONTACT_INFO.hoursLabel}</div>
                    {CONTACT_INFO.hours.map((h) => (
                      <div className="ft-hours-row" key={h.days}>
                        <span>{h.days}</span><span className="ft-hours-time">{h.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ft-info-block">
                    <div className="ft-kicker">Contact</div>
                    <h3>{CONTACT_INFO.contactTitle}</h3>
                    {CONTACT_INFO.contactLines.map((l) => (<p key={l}>{l}</p>))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="ft-form-card" id="enquiry">
                  <div className="ft-kicker">Enquiry Form</div>
                  <h3>START A CONVERSATION.</h3>
                  <p className="ft-form-sub">Tell us what you are looking for.</p>
                  {status === 'ready' ? (
                    <div className="ft-form-success" role="status" aria-live="polite">
                      <div className="ft-kicker">Enquiry Sent</div>
                      <h4>YOUR MESSAGE HAS BEEN SENT TO THE FIT TRACK TEAM.</h4>
                      <p>We have received your enquiry — the team will get back to you using your preferred contact method.</p>
                      <button type="button" className="ft-btn ft-btn-ghost" onClick={resetDemo}>SEND ANOTHER ENQUIRY</button>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} noValidate>
                      <div className="ft-field">
                        <label htmlFor="c-name">Full Name *</label>
                        <input id="c-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} placeholder="Your full name" />
                        <FieldError id="c-name-error" message={errors.name} />
                      </div>
                      <div className="ft-field-row">
                        <div className="ft-field">
                          <label htmlFor="c-email">Email *</label>
                          <input id="c-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} placeholder="you@example.com" />
                          <FieldError id="c-email-error" message={errors.email} />
                        </div>
                        <div className="ft-field">
                          <label htmlFor="c-phone">Phone (optional)</label>
                          <input id="c-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} placeholder="+91 ..." />
                          <FieldError id="c-phone-error" message={errors.phone} />
                        </div>
                      </div>
                      <div className="ft-field-row">
                        <div className="ft-field">
                          <label htmlFor="c-type">Enquiry Type *</label>
                          <select id="c-type" name="enquiryType" required value={form.enquiryType} onChange={set('enquiryType')} aria-invalid={Boolean(errors.enquiryType)}>
                            {ENQUIRY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                          </select>
                          <FieldError id="c-type-error" message={errors.enquiryType} />
                        </div>
                        <div className="ft-field">
                          <label htmlFor="c-pref">Preferred Contact (optional)</label>
                          <select id="c-pref" name="preferredContact" value={form.preferredContact} onChange={set('preferredContact')}>
                            {PREFERRED_CONTACTS.map((t) => (<option key={t} value={t}>{t}</option>))}
                          </select>
                        </div>
                      </div>
                      <div className="ft-field">
                        <label htmlFor="c-msg">Message *</label>
                        <textarea id="c-msg" name="message" rows={5} required value={form.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} placeholder="What are you training for?" />
                        <FieldError id="c-msg-error" message={errors.message} />
                      </div>
                      <button type="submit" className="ft-btn ft-btn-primary ft-form-btn" disabled={status === 'sending'}>
                        {status === 'sending' ? 'SENDING...' : 'SEND ENQUIRY →'}
                      </button>
                      {status === 'error' && serverError ? (
                        <div className="ft-form-error" role="alert">
                          <p className="ft-field-error">{serverError}</p>
                          <button type="button" className="ft-btn ft-btn-ghost" onClick={resetDemo}>RETRY</button>
                        </div>
                      ) : null}
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
        <section className="ft-section" id="reasons">
          <div className="ft-container">
            <SectionHeading kicker="Next Step" title="WHAT CAN WE HELP WITH?"
              lead="Pick a direction — each path connects to the right part of FIT TRACK." />
            <div className="ft-benefits">
              {CONTACT_REASONS.map((r, i) => (
                <Reveal key={r.k} delay={(i % 4) * 90}>
                  <Link to={r.to} className="ft-benefit ft-reason" aria-label={`${r.k} — ${r.cta}`}>
                    <span className="ft-benefit-num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{r.k}</h3>
                    <p>{r.d}</p>
                    <span className="ft-link">{r.cta} <span aria-hidden="true">→</span></span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="ft-section surface" id="location">
          <div className="ft-container">
            <SectionHeading kicker="Location" title="YOUR TRAINING FLOOR AWAITS."
              lead="Real address and live directions appear here once confirmed." />
            <Reveal>
              <div className="ft-locpanel" role="img" aria-label="FIT TRACK location placeholder — real address to be updated">
                <div className="ft-locpanel-grid" aria-hidden="true" />
                <div className="ft-locpanel-pin" aria-hidden="true"><span /></div>
                <div className="ft-locpanel-card">
                  <div className="ft-kicker">FIT TRACK</div>
                  <h3>LOCATION TO BE UPDATED</h3>
                  <p>Demo placeholder — no map embedded until verified.</p>
                  <span className="ft-btn ft-btn-ghost" aria-disabled="true">GET DIRECTIONS · SOON</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <section className="ft-section" id="faq">
          <div className="ft-container">
            <SectionHeading kicker="FAQ" title="QUICK QUESTIONS."
              lead="Short answers. For specifics, use the enquiry form." />
            <div className="ft-faq">
              {CONTACT_FAQS.map((f, i) => (
                <Reveal key={f.q} delay={(i % 4) * 60}>
                  <details className="ft-faq-item" open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="ft-cta" id="contact-cta">
          <div className="ft-cta-bg" aria-hidden="true"><img src={CTA_BG} alt="" loading="lazy" /></div>
          <div className="ft-cta-inner">
            <Reveal>
              <div className="ft-kicker" style={{ textAlign: 'center' }}>Ready When You Are.</div>
              <h2>STOP THINKING. START TRAINING.</h2>
              <p>Compare plans, explore programs, then send one enquiry.</p>
              <div className="ft-cta-btns">
                <Link to="/membership" className="ft-btn ft-btn-primary">VIEW MEMBERSHIPS →</Link>
                <Link to="/programs" className="ft-btn ft-btn-ghost">EXPLORE PROGRAMS</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
