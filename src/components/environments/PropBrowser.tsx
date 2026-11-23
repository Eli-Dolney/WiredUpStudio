import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import AssetGallery from '../AssetGallery';

const PropPreview = lazy(() => import('./PropPreview'));
const tiers = ['Simple', 'Standard', 'Showcase'] as const;
type Tier = typeof tiers[number];
type Variant = { url: string; bytes: number; sha256: string; triangles: number; dimensions: number[] };
type Family = { id: string; name: string; tiers: Record<Tier, Variant> };
type Manifest = { schemaVersion: number; pack: string; title: string; families: Family[] };

export default function PropBrowser({ pack, onClose }: {
  pack: { id: string; title: string; props: { url: string; families: number } };
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const back = useRef<HTMLButtonElement | null>(null);
  const [familyId, setFamilyId] = useState('');
  const [tier, setTier] = useState<Tier>('Standard');
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => {element.close(); document.body.style.overflow = overflow;};
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    fetch(pack.props.url, { signal: abort.signal }).then(r => { if (!r.ok) throw Error(); return r.json(); })
      .then((m: Manifest) => {
        if (m.schemaVersion !== 1 || m.pack !== pack.id || !m.families.length || !m.families.every(f => tiers.every(t => f.tiers[t]?.url))) throw Error();
        setManifest(m);
      }).catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => abort.abort();
  }, [pack.id, pack.props.url]);
  const family = manifest?.families.find(f => f.id === familyId);
  const variant = family?.tiers[tier];
  const frameSpan = family ? Math.max(...tiers.flatMap(t => family.tiers[t].dimensions)) : 1;
  return <dialog className="prop-dialog" ref={dialog} onCancel={e => {e.preventDefault();onClose();}} aria-labelledby="prop-browser-title">
    <header className="prop-dialog-header"><div><p className="kicker">Inside the pack / {pack.props.families} prop families</p><h2 id="prop-browser-title">{pack.title}</h2></div><button className="model-close" onClick={onClose} autoFocus>Close props ×</button></header>
    {error ? <p role="alert">The prop list could not load. Close this panel and try again. Pack downloads are still available.</p> : !manifest ? <p role="status">Loading the prop list…</p> : <>
      <div hidden={!!family}><AssetGallery items={manifest.families.map(f=>({name:f.name,modelUrl:f.tiers.Standard.url}))} onOpen={(item,button)=>{
        opener.current=button;
        setFamilyId(manifest.families.find(f=>f.tiers.Standard.url===item.modelUrl)!.id);
        requestAnimationFrame(()=>back.current?.focus());
      }}/></div>
      <div className="prop-main">{family && variant && <>
        <button className="model-close" ref={back} onClick={()=>{
          setFamilyId(''); requestAnimationFrame(()=>opener.current?.focus());
        }}>← All props</button>
        <div className="prop-title-row"><h3>{family.name}</h3><a href={variant.url} download>Download this GLB ↓</a></div>
        <div className="prop-tier-buttons" role="group" aria-label="Detail tier">{tiers.map(t => <button key={t} aria-pressed={tier === t} onClick={() => setTier(t)}>{t}<small>{family.tiers[t].triangles.toLocaleString()} triangles</small></button>)}</div>
        <p className="prop-tier-description">{tier === 'Simple' ? 'Broad shapes for distant or repeated props.' : tier === 'Standard' ? 'Balanced detail for ordinary gameplay distance.' : 'Extra detail for landmarks and close views.'}</p>
        <Suspense fallback={<p role="status">Loading the 3D viewer…</p>}><PropPreview url={variant.url} title={`${family.name} · ${tier}`} familyId={family.id} frameSpan={frameSpan}/></Suspense>
        <p className="prop-measurements">{variant.triangles.toLocaleString()} triangles · {(variant.bytes/1024).toFixed(0)} KB · {variant.dimensions.map(n => n.toLocaleString(undefined,{maximumFractionDigits:2})).join(' × ')} m (width × depth × height)</p>
        <p className="prop-help">Drag to rotate and inspect every side. Switching tiers keeps your viewing angle. These are the same GLB models included in the pack.</p>
      </>}</div>
    </>}
    <p className="prop-footer-note">The full pack also includes hole assemblies, scenery layouts, and separate collision guides. Simple, Standard, and Showcase are design variants.</p>
  </dialog>;
}
