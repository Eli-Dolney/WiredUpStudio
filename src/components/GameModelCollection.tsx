import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import AssetGallery from './AssetGallery';
import type { Collection, Family } from './GameAssetLibrary';

const Model = lazy(() => import('./environments/PropPreview'));
const tiers = ['Original', 'Simple', 'Standard', 'Showcase'];

function Inspector({ family, onClose }: { family: Family; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const choices = tiers.filter(tier => family.variants[tier]);
  const [tier, setTier] = useState(family.variants.Standard ? 'Standard' : choices[0]);
  const asset = family.variants[tier];
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => { element.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} className="prop-dialog" aria-labelledby="game-model-title" onCancel={event => {event.preventDefault(); onClose();}}>
    <header className="prop-dialog-header"><h2 id="game-model-title">{family.name}</h2>
      <button autoFocus className="model-close" onClick={onClose}>Back to collection</button>
    </header>
    {choices.length > 1 && <div className="game-tiers" role="group" aria-label="Detail level">{choices.map(t =>
      <button className="model-close" key={t} aria-pressed={tier===t} onClick={()=>setTier(t)}>{t}</button>)}</div>}
    <Suspense fallback={<p role="status">Loading the model viewer…</p>}>
      <Model url={asset.url} familyId={family.name} title={family.name} frameSpan={0}/>
    </Suspense>
    <a className="model-notes-link" href={asset.url} download={asset.filename}>Download {family.name} · GLB ↓</a>
  </dialog>;
}

export default function GameModelCollection({ pack }: { pack: Collection }) {
  const [selected, setSelected] = useState<Family | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const items = pack.items.map(family => {
    const v = family.variants;
    return {name:family.name, modelUrl:(v.Standard || v.Original || v.Showcase || v.Simple).url};
  });
  return <>
    <AssetGallery items={items} onOpen={(item,button) => {opener.current=button;setSelected(pack.items.find(f=>f.name===item.name)!);}}/>
    {selected && <Inspector family={selected} onClose={() => {setSelected(null);requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));}}/>}
  </>;
}
