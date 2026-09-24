import { Reveal } from '../hooks/useReveal.jsx';

export default function PageHero({ eyebrow, title, lead, bg }) {
  return (
    <section className="ft-pagehero">
      {bg && (
        <div className="ft-pagehero-bg" aria-hidden="true">
          <img src={bg} alt="" loading="eager" />
        </div>
      )}
      <div className="ft-pagehero-shade" aria-hidden="true" />
      <div className="ft-container ft-pagehero-inner">
        <Reveal>
          <div className="ft-kicker">{eyebrow}</div>
          <h1 className="ft-pagehero-title">{title}</h1>
          {lead && <p className="ft-pagehero-lead">{lead}</p>}
        </Reveal>
      </div>
    </section>
  );
}
