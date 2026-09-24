const COACHES = [
  { r: 'HEAD COACH / STRENGTH', n: 'MARCUS REED', d: '15 yrs powerlifting. 600+ athletes coached to competition totals.', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop' },
  { r: 'CONDITIONING / ENGINE', n: 'ELENA VANCE', d: 'Ex-track athlete. Engine building, sprint mechanics and work capacity.', img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop' },
  { r: 'HYPERTROPHY / MOBILITY', n: 'ALEXIS COLE', d: 'Bodybuilding + movement quality. Shoulder-safe pressing specialist.', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop' },
];

export default function TrainersSection() {
  return (
    <section className="ft-section surface" id="trainers">
      <div className="ft-container">
        <div className="ft-kicker">Elite Coaching Staff</div>
        <h2 className="ft-title" style={{ marginBottom: 48 }}>THE PEOPLE BEHIND THE PUSH.</h2>
        <div className="ft-trainers">
          {COACHES.map((c) => (
            <article className="ft-coach" key={c.n}>
              <div className="ft-coach-img"><img src={c.img} alt={c.n} loading="lazy" /></div>
              <div className="ft-coach-body"><span className="role">{c.r}</span><h3>{c.n}</h3><p>{c.d}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
