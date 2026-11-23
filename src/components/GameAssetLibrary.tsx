import { lazy, Suspense, useEffect, useState } from 'react';
import './GameAssetLibrary.css';

const Model = lazy(() => import('./environments/PropPreview'));
type Variant = { url: string; format: string; filename: string };
type Family = { name: string; variants: Record<string, Variant> };
type Part = { url: string; bytes: number; filename: string };
type Collection = { game: string; name: string; files: number; formats: string[]; inventory: string; cover: string; parts: Part[]; items: Family[] };
const tiers = ['Original', 'Simple', 'Standard', 'Showcase'];

function CollectionView({ pack }: { pack: Collection }) {
  const [familyName, setFamilyName] = useState(pack.items[0]?.name);
  const [tier, setTier] = useState('Standard');
  const [showModel, setShowModel] = useState(false);
  const family = pack.items.find(item => item.name === familyName);
  const choices = tiers.filter(key => family?.variants[key]);
  const selected = choices.includes(tier) ? tier : choices[0];
  const asset = family?.variants[selected];
  return <div className="game-library-card">
    <div className="game-library-media">
      {asset?.format === 'glb' && (showModel || !pack.cover) ?
        <Suspense fallback={<p role="status">Loading the model viewer…</p>}>
          <Model url={asset.url} familyId={pack.name+'/'+familyName} title={familyName || pack.name} frameSpan={0}/>
        </Suspense> :
        asset?.format === 'png' ? <img src={asset.url} alt={familyName}/> :
        asset?.format === 'ogg' || asset?.format === 'wav' ?
          <div className="game-listen"><p>{familyName}</p><audio controls preload="none" src={asset.url}/></div> :
        pack.cover ? <img src={pack.cover} alt={pack.name+' environment overview'}/> : null}
      {asset?.format === 'glb' && pack.cover && !showModel &&
        <button className="btn btn-volt game-open" onClick={() => setShowModel(true)}>Preview {familyName} in 3D</button>}
    </div>
    <div className="game-library-detail">
      <h3>{pack.name}</h3>
      <p className="environment-meta">{pack.files.toLocaleString()} source files · {pack.formats.join(' / ')}</p>
      <a className="model-notes-link" href={pack.inventory} target="_blank" rel="noreferrer">View file list ↗</a>
      {family && <label className="game-field">Preview asset
        <select aria-label="Preview asset" value={familyName} onChange={e => {setFamilyName(e.target.value);setShowModel(true);}}>
          {pack.items.map(item => <option key={item.name}>{item.name}</option>)}
        </select>
      </label>}
      {choices.length > 1 && <div className="game-tiers" aria-label="Detail level">{choices.map(key =>
        <button key={key} className="model-close" aria-pressed={selected === key}
          onClick={() => {setTier(key);setShowModel(true);}}>{key}</button>)}</div>}
      {asset && <a className="model-notes-link" href={asset.url} download={asset.filename}>Download {familyName} · {asset.format.toUpperCase()} ↓</a>}
      <div className="environment-downloads">{pack.parts.map((part, index) =>
        <a className="btn btn-volt model-download" key={part.url} href={part.url} download={part.filename}>
          {pack.parts.length === 1 ? 'Download collection' : 'Download part '+(index+1)+' of '+pack.parts.length}
          <span>ZIP · {(part.bytes / 1048576).toFixed(1)} MB ↓</span>
        </a>)}</div>
    </div>
  </div>;
}

export default function GameAssetLibrary() {
  const [packs, setPacks] = useState<Collection[]>([]);
  const [game, setGame] = useState('Putt Putt Party');
  const [name, setName] = useState('Sounding Key');
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/game-assets/catalog.json', {signal: controller.signal})
      .then(r => {if (!r.ok) throw Error(); return r.json();})
      .then(setPacks).catch(e => {if (e.name !== 'AbortError') setError(true);});
    return () => controller.abort();
  }, []);
  const available = packs.filter(p => p.game === game).sort((a,b) => a.name.localeCompare(b.name));
  const selected = available.find(p => p.name === name) || available[0];
  return <section id="game-assets" className="models-collection game-library" aria-labelledby="game-library-title">
    <div className="models-section-title"><h2 id="game-library-title">Game asset library</h2></div>
    <p>Explore the courses, tabletop rooms, props and soundtracks from our games. Free for personal and commercial use under <a className="model-notes-link" href="/game-assets/LICENSE.txt">CC0 1.0</a>.</p>
    {error ? <p role="alert">The game catalog could not load. Reload this page to try again.</p> :
      selected ? <>
        <div className="game-library-filters">
          <label className="game-field">Game<select aria-label="Game" value={game} onChange={e => {setGame(e.target.value);setName(e.target.value==='QuestTanks'?'Table Tanks':'Sounding Key');}}>
            {[...new Set(packs.map(p=>p.game))].map(g => <option key={g}>{g}</option>)}
          </select></label>
          <label className="game-field">Collection<select aria-label="Collection" value={selected.name} onChange={e=>setName(e.target.value)}>
            {available.map(p=><option key={p.name}>{p.name}</option>)}
          </select></label>
        </div>
        <CollectionView key={selected.game+selected.name} pack={selected}/>
      </> : <p role="status">Loading collections…</p>}
  </section>;
}
