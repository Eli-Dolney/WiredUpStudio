import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
type Controls = { select: (i:number)=>void; pause: (v:boolean)=>void; scrub: (v:number)=>void; reset: ()=>void };
export default function AtlasPreview({url,title}:{url:string;title:string}) {
 const host=useRef<HTMLDivElement>(null), api=useRef<Controls|null>(null);
 const [clips,setClips]=useState<{name:string;duration:number}[]>([]),[selected,setSelected]=useState(0),[paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[status,setStatus]=useState('Loading original GLB…'),[failed,setFailed]=useState(false),[progress,setProgress]=useState(0);
 useEffect(()=>{
  let disposed=false,frame=0,renderer:THREE.WebGLRenderer|undefined,observer:ResizeObserver|undefined,controls:OrbitControls|undefined,model:THREE.Group|undefined,mixer:THREE.AnimationMixer|undefined;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#202833');
  try {
   renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.setSize(600,460); host.current!.appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-label',`${title}: drag to orbit and scroll to zoom`);
   const camera=new THREE.PerspectiveCamera(38,1,.01,10000); controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true;
   scene.add(new THREE.HemisphereLight(0xffffff,0x778399,2)); const light=new THREE.DirectionalLight(0xffffff,3); light.position.set(4,8,5); scene.add(light);
   observer=new ResizeObserver(()=>{if(!host.current||!renderer)return; const {width,height}=host.current.getBoundingClientRect(); renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}); observer.observe(host.current!);
   new GLTFLoader().load(url,gltf=>{
    if(disposed){gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});return;}
    gltf.animations.sort((a,b)=>['Idle','Walk','Wave','Jump','Hover'].indexOf(a.name)-['Idle','Walk','Wave','Jump','Hover'].indexOf(b.name));model=gltf.scene;scene.add(model); const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),radius=Math.max(size.x,size.y,size.z);
    if(!Number.isFinite(radius)||radius<=0){setFailed(true);setStatus('This model has no visible geometry.');return;}
    const reset=()=>{camera.position.copy(center).add(new THREE.Vector3(radius*1.25,radius*.65,radius*1.65));camera.near=radius/1000;camera.far=radius*100;camera.updateProjectionMatrix();controls!.target.copy(center);controls!.update();};reset();
    mixer=new THREE.AnimationMixer(model);let action:THREE.AnimationAction|undefined,isPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setClips(gltf.animations.map((c,i)=>({name:c.name||`Clip ${i+1}`,duration:c.duration})));setStatus(gltf.animations.length?'Drag to orbit · Scroll to zoom':'No animation clips are embedded in this GLB.');
    const select=(i:number)=>{mixer!.stopAllAction();action=gltf.animations[i]?mixer!.clipAction(gltf.animations[i]):undefined;if(action){action.setLoop(['Wave','Jump'].includes(action.getClip().name)?THREE.LoopOnce:THREE.LoopRepeat,Infinity);action.clampWhenFinished=true;action.reset().play();}};select(0);
    api.current={select,pause:v=>{isPaused=v;if(!v&&action?.paused){action.reset().play();}},scrub:v=>{if(action){action.time=v*action.getClip().duration;mixer!.update(0);}},reset};
    let previousTime=performance.now(),lastUI=0;mixer.addEventListener('finished',()=>{isPaused=true;setPaused(true);});
    const draw=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(draw);const delta=Math.min((time-previousTime)/1000,.1);previousTime=time;if(!isPaused&&!document.hidden)mixer!.update(delta);controls!.update();renderer!.render(scene,camera);if(time-lastUI>100&&action){setProgress(action.time/action.getClip().duration);lastUI=time;}};frame=requestAnimationFrame(draw);
   },undefined,()=>{if(!disposed){setFailed(true);setStatus('The 3D preview could not load. Try another browser with WebGL enabled. Downloads remain available.');}});
  }catch{setFailed(true);setStatus('WebGL is unavailable in this browser. Downloads remain available.');}
  return()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();mixer?.stopAllAction();api.current=null;model?.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(material))if(v instanceof THREE.Texture)v.dispose();material.dispose();}}});renderer?.dispose();renderer?.domElement.remove();};
 },[url,title]);
 return <div className="atlas-preview"><div className="atlas-canvas" ref={host}/><p role={failed?'alert':'status'}>{status}</p>{!failed&&<div className="atlas-controls">{clips.length>0&&<><label>Animation<select value={selected} onChange={e=>{const i=Number(e.target.value);setSelected(i);setProgress(0);api.current?.select(i);}}>{clips.map((c,i)=><option key={i} value={i}>{c.name} · {c.duration.toFixed(1)}s</option>)}</select></label><button onClick={()=>{setPaused(!paused);api.current?.pause(!paused);}}>{paused?'Play':'Pause'}</button><label className="atlas-timeline">Timeline<input aria-label="Animation timeline" type="range" min="0" max="0.999" step="0.001" value={progress} onChange={e=>{const v=Number(e.target.value);setProgress(v);setPaused(true);api.current?.pause(true);api.current?.scrub(v);}}/></label></>}<button onClick={()=>api.current?.reset()}>Reset view</button></div>}</div>;
}
