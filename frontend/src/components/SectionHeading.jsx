import { Reveal } from '../hooks/useReveal.jsx';

export default function SectionHeading({ kicker, title, lead }) {
  return (
    <Reveal>
      <div className="ft-head-row">
        <div>
          {kicker && <div className="ft-kicker">{kicker}</div>}
          <h2 className="ft-title">{title}</h2>
        </div>
        {lead && <p className="ft-lead">{lead}</p>}
      </div>
    </Reveal>
  );
}
