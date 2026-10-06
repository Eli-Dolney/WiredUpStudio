import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve(process.argv[2] || 'public');
const manifest = JSON.parse(await readFile(resolve(root,'models/atlas-dragon/manifest.json'),'utf8'));
if(manifest.schemaVersion!==1 || manifest.published!==true) throw Error('Manifest is not enabled');
if(!manifest.license?.label || !manifest.license?.url) throw Error('An explicit Atlas license is required');
const path = url => { if(!/^\/models\/atlas-dragon\/[a-zA-Z0-9_.-]+$/.test(url)) throw Error(`Unsafe asset path: ${url}`); return resolve(root,`.${url}`); };
for(const file of [manifest.model,...manifest.downloads]) {
 const bytes = await readFile(path(file.url));
 if(bytes.length!==file.bytes || createHash('sha256').update(bytes).digest('hex')!==file.sha256) throw Error(`Byte count or SHA-256 mismatch: ${file.url}`);
}
const license = await readFile(path(manifest.license.url),'utf8');
if(!license.trim()) throw Error('License is empty');
const glb=await readFile(path(manifest.model.url));
if(glb.readUInt32LE(0)!==0x46546c67 || glb.readUInt32LE(4)!==2 || glb.readUInt32LE(8)!==glb.length || glb.readUInt32LE(16)!==0x4e4f534a) throw Error('Invalid GLB 2.0 container');
const document=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString('utf8'));
if(!document.meshes?.length || !document.animations?.length) throw Error('GLB must include meshes and animations');
for(const clip of document.animations) if(!clip.name?.trim() || !clip.channels?.length || !clip.samplers?.length) throw Error('Each animation needs a name and animation data');
if([...document.buffers||[],...document.images||[]].some(v=>v.uri&&!v.uri.startsWith('data:'))) throw Error('GLB has external resource dependencies');
console.log(JSON.stringify({verified:true,bytes:glb.length,meshes:document.meshes.length,animations:document.animations.map(c=>c.name),downloads:manifest.downloads.length,license:manifest.license.label},null,2));
