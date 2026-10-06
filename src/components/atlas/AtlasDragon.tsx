import { lazy, Suspense, useEffect, useState } from 'react';
import { isAtlasManifest, type AtlasManifest } from './manifest';
import './atlas.css';
const Preview = lazy(() => import('./AtlasPreview'));
export default function AtlasDragon() {
 const [pack, setPack] = useState<AtlasManifest | null>(null);
 const [open, setOpen] = useState(false);
 useEffect(() => { const controller = new AbortController(); fetch('/models/atlas-dragon/manifest.json', { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(v => { if (isAtlasManifest(v)) setPack(v); }).catch(() => {}); return () => controller.abort(); }, []);
 useEffect(() => { if (pack && location.hash === '#atlas-dragon') document.getElementById('atlas-dragon')?.scrollIntoView({ block: 'start' }); }, [pack]);
 if (!pack) return null;
 return <section id="atlas-dragon" className="atlas-section" aria-labelledby="atlas-title">
  <div className="atlas-heading"><div><p className="kicker">Featured creature / Atlas</p><h2 id="atlas-title">{pack.title}</h2></div><span className="atlas-badge">Animated character pack</span></div>
  <p className="atlas-description">{pack.description}</p>
  <div className="atlas-layout"><div className="atlas-stage">{open ? <Suspense fallback={<p role="status">Loading 3D viewer…</p>}><Preview url={pack.model.url} title={pack.title}/></Suspense> : <div className="atlas-launch">{pack.poster && <img loading="lazy" decoding="async" width="1200" height="1200" className="atlas-poster" src={pack.poster} alt="Atlas, a purple low-poly dragon with cyan markings and a lantern"/>}<h3>Meet Atlas in motion.</h3><p>Inspect the original model, explore its exported animations, and find your angle.</p><button className="btn btn-volt" onClick={() => setOpen(true)}>Open interactive preview <span>GLB · {(pack.model.bytes/1048576).toFixed(1)} MB</span></button></div>}</div>
  <aside className="atlas-pack"><p className="kicker">Inside the pack</p><h3>Ready for your next world.</h3><ul>{pack.details.map((d,i) => <li key={i}>{d}</li>)}</ul><div className="atlas-downloads">{pack.downloads.map(d => <a key={d.url} href={d.url} download><span>{d.label}<small>{d.format} · {(d.bytes/1048576).toFixed(1)} MB</small></span><span aria-hidden="true">↓</span></a>)}</div><p className="atlas-license">Free for personal and commercial use. Credit appreciated, never required. <a href={pack.license.url} target="_blank" rel="noreferrer">{pack.license.label} ↗</a></p><p className="atlas-format-note">GLB contains the exported 3D model and animation clips. Blender is the editable source. Check the included notes for import requirements.</p></aside></div>
 </section>;
}
