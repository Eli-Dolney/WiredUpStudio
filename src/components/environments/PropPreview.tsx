import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const views = {Perspective:[1,.7,1.3],Front:[0,0,1],Back:[0,0,-1],Left:[-1,0,0],Right:[1,0,0],Top:[0,1,0],Bottom:[0,-1,0]} as const;
type View = keyof typeof views;
type Runtime = {scene: THREE.Scene; renderer: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera; controls: OrbitControls; model?: THREE.Group; familyId?: string; center: THREE.Vector3; span: number; render: () => void; view: (v: View) => void};
function dispose(root: THREE.Object3D) {root.traverse(o => {if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v instanceof THREE.Texture)v.dispose();m.dispose();}}});}

export default function PropPreview({url,title,familyId,frameSpan}:{url:string;title:string;familyId:string;frameSpan:number}) {
  const host=useRef<HTMLDivElement>(null), runtime=useRef<Runtime|null>(null);
  const [state,setState]=useState<{url:string;status:string;failed:boolean}>({url,status:'Loading model…',failed:false});
  useEffect(() => {
    let renderer: THREE.WebGLRenderer|undefined, controls: OrbitControls|undefined, observer: ResizeObserver|undefined;
    try {
      const scene=new THREE.Scene();scene.background=new THREE.Color('#202833');
      renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
      host.current!.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D prop preview. Drag to orbit, pinch or scroll to zoom.');
      const camera=new THREE.PerspectiveCamera(38,1,.001,1000);controls=new OrbitControls(camera,renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff,0x7a8794,2));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(20,40,25);scene.add(light);
      const rt: Runtime={scene,renderer,camera,controls,center:new THREE.Vector3(),span:1,render:()=>renderer!.render(scene,camera),view:v=>{
        const angle=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));
        const distance=rt.span*.78/Math.sin(angle);
        camera.up.set(0,1,0);if(v==='Top'||v==='Bottom')camera.up.set(0,0,v==='Top'?-1:1);
        camera.position.copy(rt.center).add(new THREE.Vector3(...views[v]).normalize().multiplyScalar(distance));
        controls!.target.copy(rt.center);camera.near=rt.span/1000;camera.far=rt.span*100;camera.updateProjectionMatrix();
        controls!.minDistance=rt.span*.04;controls!.maxDistance=rt.span*30;controls!.update();rt.render();
      }};
      runtime.current=rt;controls.addEventListener('change',rt.render);
      observer=new ResizeObserver(()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer!.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();rt.render();});observer.observe(host.current!);
    } catch {setState({url:'',status:'3D is unavailable in this browser. You can still download the model or pack.',failed:true});}
    return ()=>{const rt=runtime.current;observer?.disconnect();controls?.dispose();if(rt?.model)dispose(rt.model);renderer?.dispose();renderer?.domElement.remove();runtime.current=null;};
  },[]);
  useEffect(()=>{
    const rt=runtime.current;if(!rt)return;
    const abort=new AbortController();let cancelled=false;
    if(rt.model){rt.scene.remove(rt.model);dispose(rt.model);rt.model=undefined;rt.render();}
    setState({url,status:`Loading ${title}…`,failed:false});
    fetch(url,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error();return r.arrayBuffer();})
      .then(data=>new GLTFLoader().parseAsync(data,''))
      .then(gltf=>{
        if(cancelled){dispose(gltf.scene);return;}
        const model=gltf.scene;model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model);
        const size=box.getSize(new THREE.Vector3());if(!Number.isFinite(size.length())||size.length()<=0){dispose(model);throw Error();}
        rt.model=model;rt.scene.add(model);
        if(rt.familyId!==familyId){rt.familyId=familyId;box.getCenter(rt.center);rt.span=Math.max(frameSpan,size.x,size.y,size.z);rt.view('Perspective');}
        rt.render();setState({url,status:`${title} loaded`,failed:false});
      }).catch(e=>{if(!cancelled&&e.name!=='AbortError')setState({url,status:'This model could not load. Select another tier or prop, or use the download link.',failed:true});});
    return ()=>{cancelled=true;abort.abort();};
  },[url,title,familyId,frameSpan]);
  const loading=!state.failed&&(state.url!==url||state.status.startsWith('Loading'));
  return <><div className="prop-canvas-wrap" aria-busy={loading}><div className="prop-canvas" ref={host}/>{(loading||state.failed)&&<div className="prop-canvas-notice">{state.url!==url&&!state.failed?'Loading model…':state.status}</div>}</div>
    <p className="prop-load-status" role={state.failed?'alert':'status'}>{state.url!==url&&!state.failed?'Loading model…':state.status}</p>
    <div className="prop-view-buttons" role="group" aria-label="Viewing angle">{(Object.keys(views) as View[]).map(v=><button key={v} onClick={()=>runtime.current?.view(v)} disabled={loading||state.failed}>{v==='Perspective'?'Reset view':v}</button>)}</div></>;
}
