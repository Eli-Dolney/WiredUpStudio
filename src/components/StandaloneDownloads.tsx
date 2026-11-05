const downloads = [
  { id: 'sunmane-lion', title: 'Sunmane Lion', details: 'Mythic lion · Blender, glTF, and rig metadata', image: true },
  { id: 'hero-lion', title: 'Hero Lion', details: 'Standalone lion · Blender and glTF', image: true },
  { id: 'decor', title: 'Park décor', details: 'Blossom trees, palms, pines, and a rock cluster.' },
  { id: 'classic-animals', title: 'Original animal models', details: 'Editable static zoo animals and their park variants.' },
  { id: 'capture-nets', title: 'Capture nets', details: 'Original and scoop-style nets with editable Blockbench variants.' },
];

export default function StandaloneDownloads() {
  return <section className="models-collection" aria-labelledby="standalone-heading">
    <div className="models-section-title"><h2 id="standalone-heading">Standalone models &amp; props</h2></div>
    <div className="models-grid">{downloads.map(item =>
      <article className="model-pack" key={item.id}>
        {item.image && <img src={`/models/standalone/${item.id}.png`} alt={item.title} loading="lazy" style={{width:'100%', aspectRatio:'16 / 9', objectFit:'contain'}} />}
        <div className="model-pack-body"><h3>{item.title}</h3><p>{item.details}</p>
          <a className="btn btn-volt model-download" href={`/models/standalone/${item.id}.zip`} download aria-label={`Download ${item.title} ZIP`}>Download ZIP ↓</a>
        </div>
      </article>
    )}</div>
  </section>;
}
