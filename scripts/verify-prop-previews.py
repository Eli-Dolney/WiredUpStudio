"""Verify every tier is the exact published GLB and its displayed triangle count is correct."""
from pathlib import Path
import json,hashlib,zipfile,struct
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'public'
c=json.loads((P/'models/environments/catalog.json').read_text());families=0;variants=0;total_bytes=0
for pack in c['packs']:
 manifest=json.loads((P/pack['props']['url'].lstrip('/')).read_text());assert manifest['pack']==pack['id']
 assert len(manifest['families'])==pack['families']==pack['props']['families']
 assert len({f['id'] for f in manifest['families']})==pack['families']
 archive=next(d for d in pack['downloads'] if d['url'].endswith('-models.zip'))
 with zipfile.ZipFile(P/archive['url'].lstrip('/')) as z:
  source=json.loads(z.read('manifest.json'));visual={(x['family'],x['tier']):x for x in source['assets'] if x['kind']=='visual'}
  for f in manifest['families']:
   families+=1;assert set(f['tiers'])=={'Simple','Standard','Showcase'}
   for tier,v in f['tiers'].items():
    assert v['url'].startswith('/models/environments/'+pack['id']+'/props/') and '..' not in v['url']
    data=(P/v['url'].lstrip('/')).read_bytes();a=visual[(f['id'],tier)];assert data==z.read(a['file'])
    assert len(data)==v['bytes'] and hashlib.sha256(data).hexdigest()==v['sha256']
    assert struct.unpack_from('<III',data)==(0x46546c67,2,len(data));n,t=struct.unpack_from('<II',data,12);assert t==0x4e4f534a
    doc=json.loads(data[20:20+n]);assert all(not r.get('uri') or r['uri'].startswith('data:') for r in doc.get('buffers',[])+doc.get('images',[]))
    tris=0
    for mesh in doc['meshes']:
     for primitive in mesh['primitives']:
      assert primitive.get('mode',4)==4 and 'COLOR_0' in primitive['attributes']
      tris+=doc['accessors'][primitive['indices'] if 'indices' in primitive else primitive['attributes']['POSITION']]['count']//3
    assert tris==v['triangles']==a['qa']['triangles'],(f['id'],tier,tris,v['triangles'])
    assert len(v['dimensions'])==3 and all(d>0 for d in v['dimensions'])
    variants+=1;total_bytes+=len(data)
assert (families,variants)==(175,525)
print(json.dumps(dict(passed=True,packs=10,families=families,variants=variants,bytes=total_bytes,source='exact published GLBs',vertex_colors=True,triangle_counts=True)))
