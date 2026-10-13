"""Copy verified exports without modifying the game project. Run with its animal-packs path."""
import sys,json,hashlib,shutil,zipfile,re
from pathlib import Path
source=Path(sys.argv[1]); site=Path(__file__).resolve().parents[1]; out=site/'public/models';out.mkdir(parents=True,exist_ok=True)
records=[];proof=[]
for number,(title,static,rigged,manifest) in enumerate([('Safari','01-Safari','02-Safari-Rigged','manifest.json'),('Ocean','03-Ocean','04-Ocean-Rigged','ocean-manifest.json'),('Arctic','05-Arctic','06-Arctic-Rigged','arctic-manifest.json'),('Ember','07-Ember','08-Ember-Rigged','ember-manifest.json')]):
 slug=title.lower(); folder=out/slug;folder.mkdir(exist_ok=True);meta=json.loads((source/manifest).read_text())['animals'];rigs=json.loads((source/rigged/'rig-manifest.json').read_text())['animals'];animals=[]
 for id,m in meta.items():
  f=source/rigged/(id+'.gltf');g=json.loads(f.read_text());assert g['skins'] and len(g['animations'])==7
  assert all(b['uri'].startswith('data:') for b in g['buffers'])
  assert not g.get('images') or all(i.get('uri','').startswith('data:') for i in g['images'])
  shutil.copy2(f,folder/f.name);pos=g['accessors'][g['meshes'][0]['primitives'][0]['attributes']['POSITION']];bounds={k:pos[k] for k in ('min','max')};dims=[b-a for a,b in zip(pos['min'],pos['max'])]
  animals.append({'id':id,'name':m.get('displayName',re.sub(r'(?<=[a-z])(?=[A-Z])',' ',id)),'triangles':g['accessors'][g['meshes'][0]['primitives'][0]['indices']]['count']//3,'bones':len(g['skins'][0]['joints']),'clips':[a['name'] for a in g['animations']],'bounds':bounds,'dimensions':dims,'medium':m.get('medium','ground'),'reference':m.get('reference',{'waterY':0}),'target':m.get('target',{'axis':'y','size':round(dims[1],2)})})
  proof.append({'path':str(f.relative_to(source)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
 readme=f'''WIRED UP STUDIOS / {title.upper()} ANIMAL PACK\n\nCC0 1.0 Universal applies to the creator-owned animal assets in this pack.\nCommercial use, modification, and redistribution are allowed.\nCredit appreciated, never required. See LICENSE.txt for scope and legal terms.\n\n8 animals. Each glTF contains a weighted skin and 7 animation clips:\nIdle, Walk, Flee, Rest, Eat, Drink, Alert.\n\nRigged/ : glTF with embedded buffers; poses and rig manifest.\nSource/ : editable Blockbench (.bbmodel), static OBJ/MTL, palette PNG, rig metadata.\nOBJ does not contain animation. Blockbench sources are static editable geometry.\nY-up, facing -Z. Safari static and rigged exports use different scales; see ART-NOTES.txt.\nRoblox import and gameplay compatibility have not been verified here.\n\nOriginal Net & Tame project exports. See ART-NOTES.txt for creation history,\nreference-only provenance, units, import guidance, and known limitations.\n'''
 with zipfile.ZipFile(out/(slug+'-animal-pack.zip'),'w',zipfile.ZIP_DEFLATED) as z:
  for src,dest in [(source/static,'Source'),(source/rigged,'Rigged')]:
   for f in sorted(src.iterdir()):
    if f.suffix in ['.bbmodel','.obj','.mtl','.png','.json','.gltf']:z.write(f,f'{title}/{dest}/{f.name}')
  z.write(source/'ART-NOTES.txt',title+'/ART-NOTES.txt');z.write(source/manifest,title+'/manifest.json');z.writestr(title+'/README.txt',readme);z.write(out/'LICENSE.txt',title+'/LICENSE.txt')
 shutil.copy2(source/(title+'-Pack.png'),out/(slug+'.png'))
 records.append({'id':slug,'title':title,'animals':animals,'bytes':(out/(slug+'-animal-pack.zip')).stat().st_size})
(out/'catalog.json').write_text(json.dumps(records));(out/'provenance.json').write_text(json.dumps(proof,indent=2));shutil.copy2(source/'ART-NOTES.txt',out/'ART-NOTES.txt')
print('Staged',sum(len(p['animals']) for p in records),'animals; ZIP bytes:',sum(p['bytes'] for p in records))
