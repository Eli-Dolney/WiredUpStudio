import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function ScenePreview({ url, title }: {url: string; title: string}) {
  const host = useRef<HTMLDivElement>(null);
  const reset = useRef<() => void>(() => {});
  const [status, setStatus] = useState('Loading the district…');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false, frame = 0, renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined, observer: ResizeObserver | undefined, model: THREE.Group | undefined;
    const disposeModel = (root: THREE.Object3D) => root.traverse(o => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        for (const material of Array.isArray(o.material) ? o.material : [o.material]) {
          for (const v of Object.values(material)) if (v instanceof THREE.Texture) v.dispose();
          material.dispose();
        }
      }
    });
    try {
      const scene = new THREE.Scene(); scene.background = new THREE.Color('#202833');
      renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.current!.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-label', `${title}: drag to orbit, pinch or scroll to zoom`);
      renderer.domElement.tabIndex = 0;
      const camera = new THREE.PerspectiveCamera(38,1,.01,1000);
      controls = new OrbitControls(camera,renderer.domElement); controls.enableDamping = true;
      scene.add(new THREE.HemisphereLight(0xffffff,0x7a8794,2));
      const light = new THREE.DirectionalLight(0xffffff,2.5); light.position.set(20,40,25); scene.add(light);
      observer = new ResizeObserver(() => {
        if (!renderer || !host.current) return;
        const {width,height} = host.current.getBoundingClientRect();
        renderer.setSize(width,height); camera.aspect=width/height; camera.updateProjectionMatrix();
      }); observer.observe(host.current!);
      new GLTFLoader().load(url, gltf => {
        if (disposed) {disposeModel(gltf.scene);return;}
        model = gltf.scene; scene.add(model);
        model.traverse(o => {if (/collision/i.test(o.name)) o.visible=false;});
        model.updateMatrixWorld(true);
        const box = new THREE.Box3();
        model.traverseVisible(o => {if (o instanceof THREE.Mesh) {o.geometry.computeBoundingBox();box.union(o.geometry.boundingBox!.clone().applyMatrix4(o.matrixWorld));}});
        const center=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3()), span=Math.max(size.x,size.y,size.z);
        if (!Number.isFinite(span) || span<=0) {setFailed(true);setStatus('This preview has no visible geometry. Downloads are still available.');return;}
        reset.current = () => {
          const distance=span/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.35;
          camera.position.copy(center).add(new THREE.Vector3(1,.85,1.3).normalize().multiplyScalar(distance));
          camera.near=span/1000;camera.far=span*100;camera.updateProjectionMatrix();
          controls!.target.copy(center);controls!.maxDistance=span*8;controls!.minDistance=span*.03;controls!.update();
        };reset.current();setStatus('Drag to orbit · Pinch or scroll to zoom · Right-drag to pan');
        const draw = () => {if(disposed)return;frame=requestAnimationFrame(draw);if(!document.hidden){controls!.update();renderer!.render(scene,camera);}};draw();
      },undefined,() => {if(!disposed){setFailed(true);setStatus('The 3D preview could not load. You can still use the images and downloads above.');}});
    } catch {setFailed(true);setStatus('3D preview is unavailable in this browser. Images and downloads are still available.');}
    return () => {disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(model)disposeModel(model);renderer?.dispose();renderer?.domElement.remove();reset.current=()=>{};};
  },[url,title]);
  return <><div className="environment-canvas" ref={host}/><div className="environment-viewer-controls"><p role={failed?'alert':'status'}>{status}</p>{!failed&&<button className="model-close" onClick={() => reset.current()}>Reset view</button>}</div></>;
}
