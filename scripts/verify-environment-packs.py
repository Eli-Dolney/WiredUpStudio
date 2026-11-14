"""Validate public catalog, exact archive payloads and GLB self-containment."""
from pathlib import Path
import json,hashlib,zipfile,struct,sys,re
R=Path(__file__).resolve().parents[1];P=R/'public';releases=Path(sys.argv[1])
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def digest(b):return hashlib.sha256(b).hexdigest()
c=read(P/'models/environments/catalog.json');release=read(releases/'release-manifest.json')
assert len(c['packs'])==10 and len({p['id'] for p in c['packs']})==10
assert sum(p['components'] for p in c['packs'])==920
assert sum(p['families'] for p in c['packs'])==175
assert sum(len(p['holes']) for p in c['packs'])==39
all_files={x['name']:x for x in release['files']}
checks=0
for pack in c['packs']:
 for key in ['image','notes']:
  assert pack[key].startswith('/models/environments/') and (P/pack[key].lstrip('/')).is_file()
 model=pack['model'];b=(P/model['url'].lstrip('/')).read_bytes()
 assert len(b)==model['bytes'] and digest(b)==model['sha256']
 assert struct.unpack_from('<III',b)==(0x46546c67,2,len(b))
 length,kind=struct.unpack_from('<II',b,12);assert kind==0x4e4f534a
 doc=json.loads(b[20:20+length]);assert doc['meshes'] and doc['scenes']
 assert all(not x.get('uri') or x['uri'].startswith('data:') for x in doc.get('buffers',[])+doc.get('images',[]))
 for kind in ['models','unity']:
  name=pack['id']+'-'+kind+'.zip';expected=all_files[name];data=(releases/name).read_bytes()
  assert len(data)==expected['bytes'] and digest(data)==expected['sha256']
  with zipfile.ZipFile(releases/name) as z:
   names=z.namelist();assert len(names)==len(set(names)) and z.testzip() is None
   assert all(not n.startswith('/') and '..' not in Path(n).parts for n in names)
   checksum=next(n for n in names if n.endswith('/checksums.json') or n=='checksums.json')
   manifest_name=next(n for n in names if n.endswith('/manifest.json') or n=='manifest.json')
   manifest=json.loads(z.read(manifest_name));prefix=manifest_name.removesuffix('manifest.json')
   assert len(manifest['assets'])==pack['components']
   expected_fbx=pack['components']+len(pack['holes'])+1
   assert sum(n.endswith('.fbx') for n in names)==expected_fbx
   assert sum(n.endswith('.glb') for n in names)==(expected_fbx if kind=='models' else 0)
   for asset in manifest['assets']:
    for key in ['fbx_file']+(['file'] if kind=='models' else []):assert prefix+asset[key] in names
   for n,item in json.loads(z.read(checksum)).items():
    payload=z.read(n);assert len(payload)==item['bytes'] and digest(payload)==item['sha256'];checks+=1
   assert all(not re.search(rb'(?<![A-Za-z0-9])[A-Za-z]:[\\/]',z.read(n)) for n in names if n.endswith(('.json','.txt')))
   if release['license_approved']:assert any(n.endswith('LICENSE.txt') for n in names)
 for d in pack['downloads']:
  expected=all_files[d['url'].rsplit('/',1)[-1]];assert all(d[k]==expected[k] for k in ['url','bytes','sha256'])
 if release['license_approved']:
  assert len(pack['downloads'])==2 and c['license']['label']=='CC0 1.0 Universal'
  for download in pack['downloads']:assert digest((P/download['url'].lstrip('/')).read_bytes())==download['sha256']
 else:assert not pack['downloads'] and c['license'] is None
print(json.dumps(dict(passed=True,packs=10,components=920,families=175,hole_kits=39,archives=20,payload_checks=checks,license_approved=release['license_approved'])))
