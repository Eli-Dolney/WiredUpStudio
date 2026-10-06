export type AssetFile = { url: string; bytes: number; sha256: string };
export type AtlasManifest = {
 schemaVersion: 1; published: true; poster?: string; title: string; description: string;
 model: AssetFile; downloads: (AssetFile & { label: string; format: 'GLB' | 'BLEND' | 'ZIP' })[];
 license: { label: string; url: string }; details: string[];
};
const localAsset = (v: unknown): v is string => typeof v === 'string' && /^\/models\/atlas-dragon\/[a-zA-Z0-9_.-]+$/.test(v);
const file = (v: any) => v && localAsset(v.url) && Number.isSafeInteger(v.bytes) && v.bytes > 0 && /^[a-f0-9]{64}$/.test(v.sha256);
export function isAtlasManifest(v: any): v is AtlasManifest {
 return v?.schemaVersion === 1 && v.published === true && typeof v.title === 'string' && v.title.trim().length > 0 && typeof v.description === 'string' && (v.poster === undefined || localAsset(v.poster)) && file(v.model) && v.model.url.endsWith('.glb') && Array.isArray(v.downloads) && v.downloads.length > 0 && v.downloads.every((d: any) => file(d) && typeof d.label === 'string' && ['GLB','BLEND','ZIP'].includes(d.format)) && typeof v.license?.label === 'string' && v.license.label.trim().length > 0 && localAsset(v.license.url) && Array.isArray(v.details) && v.details.every((d: unknown) => typeof d === 'string');
}
