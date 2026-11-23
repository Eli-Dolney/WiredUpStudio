import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(384, 288);
renderer.setClearColor(0, 0);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xfff9ee, 0xaebeda, 1.75));
const sun = new THREE.DirectionalLight(0xffeedb, 2.15);
sun.position.set(-3, 7, 5);
scene.add(sun);
const rim = new THREE.DirectionalLight(0xb8d9ff, 1);
rim.position.set(4, 2, -4);
scene.add(rim);
const loader = new GLTFLoader();

window.renderThumbnail = async function({url, tank, detail}) {
  const {scene: model} = await loader.loadAsync(url);
  scene.add(model);
  try {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const center = box.getCenter(new THREE.Vector3());
    const span = box.getSize(new THREE.Vector3()).length();
    if (!(span > 0)) throw Error('Empty mesh: ' + url);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, span * .01, span * 6);
    camera.position.copy(center).addScaledVector(new THREE.Vector3(1,.75,tank ? -1.45 : 1.45).normalize(), span * 2);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    // Frame the projected vertices so long, thin props fill their card too.
    const silhouette = new THREE.Box3();
    const point = new THREE.Vector3();
    const transform = new THREE.Matrix4();
    model.traverseVisible(mesh => {
      if (!mesh.isMesh) return;
      transform.multiplyMatrices(camera.matrixWorldInverse, mesh.matrixWorld);
      const positions = mesh.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        silhouette.expandByPoint(point.fromBufferAttribute(positions,i).applyMatrix4(transform));
      }
    });
    const middle = silhouette.getCenter(new THREE.Vector3());
    const size = silhouette.getSize(new THREE.Vector3());
    const halfHeight = Math.max(size.y, size.x * .75) * .57;
    camera.left = middle.x - halfHeight * 4/3;
    camera.right = middle.x + halfHeight * 4/3;
    camera.bottom = middle.y - halfHeight;
    camera.top = middle.y + halfHeight;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    if (detail) {
      // Scenery groups span an entire course. Frame a populated part of their layout.
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 24;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(renderer.domElement, 0, 0, 32, 24);
      const pixels = ctx.getImageData(0, 0, 32, 24).data;
      let best = -1, cx = 16, cy = 12;
      for (let y = 0; y <= 16; y++) for (let x = 0; x <= 22; x++) {
        let sum = 0;
        for (let v = y; v < y+8; v++) for (let u = x; u < x+10; u++) sum += pixels[(v*32+u)*4+3];
        if (sum > best) { best = sum; cx = x+5; cy = y+4; }
      }
      camera.setViewOffset(384, 288, cx*12-72, cy*12-54, 144, 108);
      renderer.render(scene, camera);
    }
    return renderer.domElement.toDataURL('image/webp', .86).split(',')[1];
  } finally {
    scene.remove(model);
    model.traverse(obj => {
      obj.geometry?.dispose();
      for (const material of [].concat(obj.material || [])) {
        for (const tex of Object.values(material)) if (tex?.isTexture) {tex.source.data?.close?.();tex.dispose();}
        material.dispose();
      }
    });
  }
};
