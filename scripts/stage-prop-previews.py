"""Extract exact visual-tier GLBs from the published packs for on-demand previews."""
from pathlib import Path
import json,zipfile,hashlib,re
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';BASE=PUBLIC/'models/environments'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def label(s):return re.sub(r'(?<=[a-z0-9])(?=[A-Z])',' ',s).replace('_',' ')
c=read(BASE/'catalog.json');total=0;size=0
for pack in c['packs']:
 archive=next(d for d in pack['downloads'] if d['url'].endswith('-models.zip'))
 with zipfile.ZipFile(PUBLIC/archive['url'].lstrip('/')) as z:
  m=json.loads(z.read('manifest.json'));families={}
  for asset in m['assets']:
   if asset['kind']!='visual':continue
   family=asset['family'];tier=asset['tier'];assert tier in ['Simple','Standard','Showcase']
   row=families.setdefault(family,dict(id=family,name=label(family),tiers={}))
   assert tier not in row['tiers']
   data=z.read(asset['file']);path=BASE/pack['id']/'props'/(asset['id']+'.glb');path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
   qa=asset['qa'];row['tiers'][tier]=dict(url='/'+path.relative_to(PUBLIC).as_posix(),bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),triangles=qa['triangles'],dimensions=[round(b-a,5) for a,b in zip(qa['bounds_min'],qa['bounds_max'])])
   total+=1;size+=len(data)
  assert len(families)==pack['families']
  for row in families.values():assert set(row['tiers'])=={'Simple','Standard','Showcase'}
  manifest=dict(schemaVersion=1,pack=pack['id'],title=pack['title'],families=list(families.values()))
  out=BASE/pack['id']/'props.json';out.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
  pack['props']=dict(url='/'+out.relative_to(PUBLIC).as_posix(),families=len(families),variants=len(families)*3)
(BASE/'catalog.json').write_text(json.dumps(c,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(packs=len(c['packs']),families=total//3,variants=total,bytes=size)))
