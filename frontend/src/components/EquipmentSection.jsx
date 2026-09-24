const ZONES = [
  { z: 'ZONE 01', t: 'STRENGTH FLOOR', d: 'Heavy compound movements, power racks and deadlift platforms.', img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000&auto=format&fit=crop' },
  { z: 'ZONE 02', t: 'CONDITIONING LAB', d: 'High-output aerobic equipment, turf tracks and sleds.', img: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1000&auto=format&fit=crop' },
  { z: 'ZONE 03', t: 'FUNCTIONAL AREA', d: 'Open athletic space — rings, kettlebells and cable columns.', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop' },
  { z: 'ZONE 04', t: 'RECOVERY SPACE', d: 'Mobility rigs, stretching bays and breathwork zone.', img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop' },
];

export default function EquipmentSection() {
  return (
    <section className="ft-section surface" id="equipment">
      <div className="ft-container">
        <div className="ft-kicker">Layout Directory</div>
        <h2 className="ft-title" style={{ marginBottom: 48 }}>CHOOSE YOUR BATTLEFIELD.</h2>
        <div className="ft-zones">
          {ZONES.map((x) => (
            <div className="ft-zone" key={x.z}>
              <img src={x.img} alt={x.t} loading="lazy" />
              <div><span className="z">{x.z}</span><h3>{x.t}</h3><p>{x.d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
