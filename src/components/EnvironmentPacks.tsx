import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './EnvironmentPacks.css';
import PropBrowser from './environments/PropBrowser';

const ScenePreview = lazy(() => import('./environments/ScenePreview'));
type File = { url: string; bytes: number; sha256: string };
type Pack = {
  id: string; title: string; description: string; families: number; components: number;
  holes: string[]; image: string; model: File; notes: string;
  downloads: (File & { label: string })[];
  props?: { url: string; families: number; variants: number };
};
type Catalog = { packs: Pack[]; license: { label: string; url: string } | null };

export default function EnvironmentPacks() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Pack | null>(null);
  const [propPack, setPropPack] = useState<(Pack & {props: NonNullable<Pack['props']>}) | null>(null);
  const propOpener = useRef<HTMLButtonElement | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch('/models/environments/catalog.json', { signal: abort.signal })
      .then(r => { if (!r.ok) throw Error(); return r.json(); })
      .then((data: Catalog) => { if (!Array.isArray(data.packs)) throw Error(); setCatalog(data); })
      .catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => abort.abort();
  }, []);
  function preview(pack: Pack, button: HTMLButtonElement) {
    opener.current = button; setSelected(pack);
    requestAnimationFrame(() => {
      previewRef.current?.focus({ preventScroll: true });
      previewRef.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    });
  }
  const packs = catalog?.packs ?? [];
  return <section id="environments" className="models-collection environment-collection" aria-labelledby="environment-title">
    <div className="models-section-title"><div><p className="kicker">Build a place to play</p><h2 id="environment-title">Themed worlds &amp; mini golf</h2></div>
      <label className="environment-filter" htmlFor="environment-theme-filter">Theme<select id="environment-theme-filter" value={filter} onChange={e => { setFilter(e.target.value); setSelected(null); }}><option value="all">All themes</option>{packs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    </div>
    <p className="environment-intro">Coastal villages, candy towns, orbital stations, and more. Mix buildings, trees, rocks, bridges, obstacles, and skyline pieces—or start with a complete three-hole district.</p>
    {catalog && <div className="environment-summary"><span><b>{packs.length}</b> themes</span><span><b>{packs.reduce((n,p) => n+p.families,0)}</b> prop families</span><span><b>{packs.reduce((n,p) => n+p.holes.length,0)}</b> hole kits</span><span><b>3</b> detail tiers</span></div>}
    <div className="environment-tiers"><p><b>Simple</b>Clear silhouettes for repeated or distant scenery.</p><p><b>Standard</b>The everyday version for normal play distance.</p><p><b>Showcase</b>Extra detail for landmarks and close views.</p></div>
    {catalog?.license && <p className="environment-license">Free under <a href={catalog.license.url}>{catalog.license.label}</a>. Personal and commercial use. Credit appreciated.</p>}
    {error ? <p role="alert">The environment catalog could not load. Please refresh to try again.</p> : !catalog ? <p role="status">Loading the themed worlds…</p> : <div className="models-grid">
      {packs.filter(p => filter === 'all' || p.id === filter).map(pack => <article className="model-pack environment-pack" id={`environment-${pack.id}`} key={pack.id}>
        <div className="model-pack-top"><span>WORLD / {pack.title.toUpperCase()}</span><span>{pack.families} FAMILIES</span></div>
        <button className="model-art environment-art" onClick={e => preview(pack,e.currentTarget)} aria-label={`Explore ${pack.title} district in 3D`}><img src={pack.image} alt={`${pack.title}: three mini golf holes arranged with themed buildings and background scenery`} loading="lazy" width="1000" height="750"/><span>Explore the district in 3D ↗</span></button>
        <div className="model-pack-body"><h3>{pack.title}</h3><p>{pack.description}</p>
          <div className="environment-meta">{pack.components} components · {pack.holes.length} hole kits · 1 district</div>
          {pack.props && <button className="prop-browse-button" aria-label={`Browse ${pack.title} props`} onClick={e => {propOpener.current=e.currentTarget;setSelected(null);setPropPack({...pack,props:pack.props!});}}><span>Browse props &amp; compare tiers ↗</span><small>{pack.props.families} props · Simple / Standard / Showcase</small></button>}
          <details className="environment-included"><summary>Included holes</summary><ul>{pack.holes.map(h => <li key={h}>{h}</li>)}</ul></details>
          <div className="model-formats">FBX + GLB · Vertex colors · Separate collision guides<br/>Simple / Standard / Showcase</div>
          <div className="environment-downloads">{pack.downloads.map(d => <a className="btn btn-volt model-download" key={d.url} href={d.url} aria-label={`Download ${pack.title} ${d.label}`}><span>{d.label}</span><span>ZIP · {(d.bytes/1048576).toFixed(1)} MB ↓</span></a>)}</div>
          <a className="model-notes-link" href={pack.notes}>Contents &amp; import notes ↗</a>
        </div>
      </article>)}
    </div>}
    {selected && <section className="model-inspector environment-inspector" ref={previewRef} tabIndex={-1} aria-label={`${selected.title} interactive district preview`}>
      <div className="models-section-title"><div><p className="kicker">Actual exported geometry</p><h2>{selected.title}</h2></div><button className="model-close" onClick={() => {setSelected(null);opener.current?.focus();}}>Close preview ×</button></div>
      <Suspense fallback={<p role="status">Loading the 3D viewer…</p>}><ScenePreview key={selected.id} url={selected.model.url} title={selected.title}/></Suspense>
      <p className="environment-preview-note">A static GLB scene preview. Collision guides are hidden. In-game lighting and animated water can look different.</p>
    </section>}
    <p className="environment-footnote">The kits include geometry and placement guides. Add your game’s scoring, ball physics, colliders, and player navigation. Detail tiers are authored variants, not automatic LODs. Quest performance and stereo still need testing in your game.</p>
    {propPack && <PropBrowser key={propPack.id} pack={propPack} onClose={() => {setPropPack(null);requestAnimationFrame(() => propOpener.current?.focus({preventScroll:true}));}}/>}
  </section>;
}
