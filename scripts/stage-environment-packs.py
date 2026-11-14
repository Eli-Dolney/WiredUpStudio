"""Stage public, portable asset downloads from the accepted library. No upload occurs."""
from pathlib import Path
import argparse,hashlib,json,re,zipfile,shutil
from PIL import Image,ImageOps
p=argparse.ArgumentParser();p.add_argument('--library',type=Path,required=True);p.add_argument('--releases',type=Path,required=True);p.add_argument('--cc0',action='store_true');a=p.parse_args()
ROOT=Path(__file__).resolve().parents[1];WEB=ROOT/'public/models/environments';WEB.mkdir(parents=True,exist_ok=True);a.releases.mkdir(parents=True,exist_ok=True)
TAG='environment-packs-2026-11';BASE='/models/environments/downloads/'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(data):return hashlib.sha256(data).hexdigest()
def record(path,url):return dict(url=url,bytes=path.stat().st_size,sha256=sha(path.read_bytes()))
def clean(v):
 if isinstance(v,dict):return {k:clean(x) for k,x in v.items() if k not in ['source_root','source_folder','source','superseded','review','preview']}
 if isinstance(v,list):return [clean(x) for x in v]
 if isinstance(v,str) and re.search(r'(?<![A-Za-z0-9])[A-Za-z]:[\\/]',v):return Path(v.replace('\\','/')).name
 return v
themes=[
 ('PirateCove','pirate-cove','Pirate Cove','Timber harbors, coastal villages, ships, skull passages, and a lighthouse skyline.'),
 ('Candyland','candyland','Candyland','Gingerbread buildings, cookie bridges, peppermint obstacles, and a sugar windmill town.'),
 ('SpaceStation','space-station','Space Station','Airlocks, solar trusses, docking bridges, habitat buildings, and an orbital-ring backdrop.'),
 ('HauntedWoods','haunted-woods','Haunted Woods','Crooked cottages, hollow trees, root bridges, graveyard obstacles, and a manor courtyard.'),
 ('Tropical','tropical','Tropical','Stilt huts, palms, tiki gates, lagoon boardwalks, rock grottoes, and island silhouettes.'),
 ('Blockland','blockland','Blockland','Stepped houses, castle gateways, modular retaining walls, archways, and a tower square.'),
 ('Backyard','backyard','Backyard','Garden sheds, greenhouses, flower beds, hedges, wheelbarrow chutes, and neighborhood scenery.'),
 ('Desert','desert','Desert','Frontier buildings, mine passages, ore carts, water towers, cactus gardens, and mesa walls.'),
 ('Frosty','frosty','Frosty','Snowy cabins, igloos, timber bridges, ice arches, pine groves, and mountain silhouettes.'),
 ('Neon','neon-city','Neon City','Arcade buildings, pixel gates, skybridges, pinball bumpers, cyber gardens, and a city skyline.')]
license_text='''WIRED UP STUDIOS — THEMED ENVIRONMENT ASSETS
SPDX-License-Identifier: CC0-1.0

To the extent possible under law, the creator has waived all copyright and
related or neighboring rights in the creator-owned assets in these ten packs
under CC0 1.0 Universal: Pirate Cove, Candyland, Space Station, Haunted Woods,
Tropical, Blockland, Backyard, Desert, Frosty, and Neon City.
You may copy, modify, distribute and use these assets, including commercially,
without asking permission. Credit appreciated, never required.
Governing legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode

Scope: original meshes, vertex colors, scene layouts, collision guides and asset
metadata in these environment downloads. This notice does not relicense the
website, third-party software, dependencies, trademarks or reference material.
Existing third-party rights remain unaffected. Assets are provided as-is.
CC0 does not grant trademark or patent rights.
'''
if a.cc0:(WEB/'LICENSE.txt').write_text(license_text,encoding='utf-8')
pr=read(a.library/'progress.json');packs=[];release_files=[]
for theme,slug,title,description in themes:
 B=a.library/pr['themes'][theme]['improvement_batch'];m=read(B/'manifest.json');dest=WEB/slug;dest.mkdir(exist_ok=True)
 pirate=theme=='PirateCove';kitdir='Holes' if pirate else 'kits'
 assets=[];payload={};unity={};prefix='Assets/ThirdParty/'+theme+'Environments/'
 for src in m['assets']:
  asset=clean(src);asset['file']='Models/glb/'+src['id']+'.glb';asset['fbx_file']='Models/fbx/'+src['id']+'.fbx'
  for key in ['file','fbx_file']:
   data=(B/src[key]).read_bytes();payload[asset[key]]=data
   if key=='fbx_file':unity[prefix+asset[key]]=data
  assets.append(asset)
 holes=[];hole_records=[]
 for h in m['kits']:
  ident=h['id'];layout=clean(read(B/kitdir/ident/'layout.json'));holes.append(layout.get('name',re.sub(r'(?<=[a-z])(?=[A-Z])',' ',ident)))
  for ext in ['fbx','glb']:
   path=f'Holes/{ident}/{ident}_Assembly.{ext}';data=(B/kitdir/ident/(ident+'_Assembly.'+ext)).read_bytes();payload[path]=data
   if ext=='fbx':unity[prefix+path]=data
  path=f'Holes/{ident}/layout.json';data=json.dumps(layout,indent=2).encode();payload[path]=data;unity[prefix+path]=data
  hole_records.append(dict(id=ident,name=holes[-1],layout=path))
 district=theme+'_District_Assembly'
 for ext in ['fbx','glb']:
  path=f'District/{district}.{ext}';data=(B/path).read_bytes();payload[path]=data
  if ext=='fbx':unity[prefix+path]=data
  else:(dest/'district.glb').write_bytes(data)
 layout=clean(read(B/'District/layout.json'));data=json.dumps(layout,indent=2).encode();payload['District/layout.json']=data;unity[prefix+'District/layout.json']=data
 families=len({x['family'] for x in assets if x['kind']=='visual'})
 notes=f'''{title.upper()} — THEMED ENVIRONMENT PACK
{description}

{families} visual families in Simple, Standard and Showcase tiers.
{len(assets)} component meshes, {len(holes)} hole geometry kits, one three-hole district.
Components include tier variants, collision guides and course pieces.
Included holes: {', '.join(holes)}.

CONTENTS
FBX + GLB pack: all component exports, complete hole assemblies, district,
portable manifests and this guide. GLB meshes can be opened and edited in Blender.
Unity pack: the same FBX models and placement metadata under Assets/ThirdParty/.
Native Blender source libraries and production tool scripts are not in these web ZIPs.

IMPORT
Keep assembled holes at their exported scale. Sources use metres and Blender
Z-up; FBX applies the Unity axis conversion. Preserve TEE/CUP marker transforms.
Cup diameter is 0.108m; depth is 0.1m. Shrinking a whole hole shrinks its cup.
Use a vertex-color material: the palette is stored on the meshes, not textures.
Hide all Collision, FloorCollision and RailCollision guide renderers.
Build/weld putting contact surfaces for your physics system; avoid duplicated
floor or rail contacts. Do not close tunnels with a single convex collider.
Choose individual kits OR the district to avoid duplicate course geometry.
Simple/Standard/Showcase are design variants, not automatic runtime LODGroups.
Wire scoring, cup triggers, friction, ball resets and player navigation in your game.
District connectors are layout guides, not validated player walk/teleport paths.

VALIDATION AND LIMITS
Geometry, specified symmetry, source/export round trips, open passages and cup
dimensions were checked. FBX files were imported in isolated desktop Unity.
These checks do not prove ball physics, final pars, navigation, headset stereo,
Quest frame timing, memory or thermal performance. Test your complete scene.
Water in the web GLB preview is static vertex-colored geometry.
Moving props are posed geometry. Runtime mechanics require game implementation.
Original low-poly production geometry was built in Blender, not ComfyUI.

LICENSE
'''+('CC0 1.0 Universal. See LICENSE.txt. Credit appreciated, never required.\n' if a.cc0 else 'Publication is pending the owner\'s license selection.\n')
 (dest/'README.txt').write_text(notes,encoding='utf-8');payload['README.txt']=notes.encode();unity[prefix+'README.txt']=notes.encode()
 manifest=dict(theme=theme,version=m['version'],units='metres',tiers=['Simple','Standard','Showcase'],assets=assets,kits=hole_records,district='District/'+district+'.glb')
 data=json.dumps(manifest,indent=2).encode();payload['manifest.json']=data
 unity_manifest=dict(manifest);unity_manifest['assets']=[{k:v for k,v in asset.items() if k!='file'} for asset in assets];unity_manifest['district']='District/'+district+'.fbx'
 unity[prefix+'manifest.json']=json.dumps(unity_manifest,indent=2).encode()
 if a.cc0:payload['LICENSE.txt']=license_text.encode();unity[prefix+'LICENSE.txt']=license_text.encode()
 image_source=B/'District/UnityPreview/Harbor_TurquoiseCove.png' if pirate else B/'UnityPreview'/(district+'_Unity.png')
 im=ImageOps.contain(Image.open(image_source).convert('RGB'),(1000,750));canvas=Image.new('RGB',(1000,750),'#202833');canvas.paste(im,((1000-im.width)//2,(750-im.height)//2));canvas.save(dest/'district.jpg',quality=87,optimize=True)
 payload['district.jpg']=(dest/'district.jpg').read_bytes()
 downloads=[]
 for label,kind,files in [('FBX + GLB pack','models',payload),('Unity import pack','unity',unity)]:
  filename=f'{slug}-{kind}.zip';out=a.releases/filename
  checks={n:dict(bytes=len(data),sha256=sha(data)) for n,data in files.items()};files[('' if kind=='models' else prefix)+'checksums.json']=json.dumps(checks,indent=2).encode()
  with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
   for name,data in files.items():z.writestr(name,data)
  with zipfile.ZipFile(out) as z:
   assert z.testzip() is None
   assert all(not re.search(rb'(?<![A-Za-z0-9])[A-Za-z]:[\\/]',z.read(n)) for n in z.namelist() if n.endswith('.json')),filename
  item=record(out,BASE+filename);release_files.append(dict(item,name=filename,theme=theme))
  if a.cc0:
   (WEB/'downloads').mkdir(exist_ok=True);shutil.copy2(out,WEB/'downloads'/filename)
   downloads.append(dict(item,label=label))
 packs.append(dict(id=slug,title=title,description=description,families=families,components=len(assets),holes=holes,
  image='/models/environments/'+slug+'/district.jpg',model=record(dest/'district.glb','/models/environments/'+slug+'/district.glb'),notes='/models/environments/'+slug+'/README.txt',downloads=downloads))
 print('STAGED',slug,len(assets),'components',flush=True)
catalog=dict(schemaVersion=1,license=dict(label='CC0 1.0 Universal',url='/models/environments/LICENSE.txt') if a.cc0 else None,packs=packs)
(WEB/'catalog.json').write_text(json.dumps(catalog,indent=2),encoding='utf-8')
(a.releases/'release-manifest.json').write_text(json.dumps(dict(tag=TAG,license_approved=a.cc0,files=release_files),indent=2),encoding='utf-8')
print('STAGING_COMPLETE',sum(x['bytes'] for x in release_files),'download bytes')
