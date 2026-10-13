import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {loadGltfRig,skinGltfRig} from '../public/models/gltf-rig-reader.js';
const root=path.resolve(import.meta.dirname,'../public/models');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json')));
let models=0,samples=0;
assert.deepEqual(catalog.map(p=>p.id),['safari','ocean','arctic','ember','crystal','sky','jungle']);
for(const pack of catalog){assert.equal(pack.animals.length,8);for(const animal of pack.animals){
 const gltf=JSON.parse(fs.readFileSync(path.join(root,pack.id,animal.id+'.gltf'))),rig=loadGltfRig(gltf);
 assert.deepEqual(Object.keys(rig.clips),['Idle','Walk','Flee','Rest','Eat','Drink','Alert']);
 assert.equal(rig.indices.length/3,animal.triangles);
 for(const clip of Object.keys(rig.clips))for(const phase of [0,.25,.5,.75]){const points=skinGltfRig(rig,clip,rig.clips[clip].duration*phase);assert.ok(points.every(Number.isFinite));samples++}
 models++;
}}
console.log(`Verified ${models} glTF models, ${models*7} clips, ${samples} finite skinned poses.`);
