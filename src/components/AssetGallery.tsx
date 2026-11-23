import { useState } from 'react';
import './AssetGallery.css';

export type GalleryItem = { name: string; modelUrl: string };

export default function AssetGallery({ items, onOpen }: {
  items: GalleryItem[];
  onOpen: (item: GalleryItem, button: HTMLButtonElement) => void;
}) {
  const [query, setQuery] = useState('');
  const match = query.trim().toLocaleLowerCase();
  const visible = items.filter(item => item.name.toLocaleLowerCase().includes(match));

  return <div className="asset-gallery">
    <div className="asset-gallery-tools">
      {items.length > 1 && <label>Find an asset
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name"/>
      </label>}
      <span role="status">{match ? visible.length+' of '+items.length : items.length} {items.length === 1 ? 'asset' : 'assets'}</span>
    </div>
    {visible.length ? <ul className="asset-tiles">{visible.map(item => {
      const filename = item.modelUrl.split('/').pop()!.replace(/\.glb$/i, '.webp');
      return <li key={item.modelUrl+'-'+item.name}>
        <button type="button" aria-label={'Preview '+item.name+' in 3D'} onClick={event => onOpen(item, event.currentTarget)}>
          <img src={'/asset-thumbnails/'+filename} width="384" height="288" loading="lazy" decoding="async" alt=""/>
          <span>{item.name}<i aria-hidden="true">↗</i></span>
        </button>
      </li>;
    })}</ul> : <p>No assets match “{query.trim()}”.</p>}
  </div>;
}
