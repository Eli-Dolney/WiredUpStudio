// Small offline reader for the exported glTF skins. Used by previews and QA.
export function loadGltfRig(gltf) {
  const encoded=gltf.buffers[0].uri.split(',')[1];
  const bytes=typeof Buffer!=='undefined'?Uint8Array.from(Buffer.from(encoded,'base64')):Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  function read(index){
    const a=gltf.accessors[index],b=gltf.bufferViews[a.bufferView];
    const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],size=a.componentType===5123?2:4;
    const values=new Float64Array(a.count*width),offset=(b.byteOffset||0)+(a.byteOffset||0);
    for(let i=0;i<a.count;i++)for(let j=0;j<width;j++){
      const p=offset+i*(b.byteStride||width*size)+j*size;
      values[i*width+j]=a.componentType===5126?view.getFloat32(p,true):a.componentType===5123?view.getUint16(p,true):view.getUint32(p,true);
    }
    return values;
  }
  const skin=gltf.skins[0],p=gltf.meshes[0].primitives[0],parents=gltf.nodes.map(()=>-1);
  gltf.nodes.forEach((n,i)=>(n.children||[]).forEach(child=>parents[child]=i));
  const clips=Object.fromEntries(gltf.animations.map(a=>[a.name,{duration:Math.max(...read(a.samplers[0].input)),channels:a.channels.map(c=>{const s=a.samplers[c.sampler];return {node:c.target.node,path:c.target.path,times:read(s.input),values:read(s.output)};})}]));
  return {nodes:gltf.nodes,parents,bones:skin.joints,binds:read(skin.inverseBindMatrices),positions:read(p.attributes.POSITION),colors:read(p.attributes.COLOR_0),joints:read(p.attributes.JOINTS_0),weights:read(p.attributes.WEIGHTS_0),indices:read(p.indices),clips};
}

export function skinGltfRig(rig,state,time,bindPose=false) {
  const mul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
  const rotate=(q,v)=>{
    const tx=2*(q[1]*v[2]-q[2]*v[1]),ty=2*(q[2]*v[0]-q[0]*v[2]),tz=2*(q[0]*v[1]-q[1]*v[0]);
    return [v[0]+q[3]*tx+q[1]*tz-q[2]*ty,v[1]+q[3]*ty+q[2]*tx-q[0]*tz,v[2]+q[3]*tz+q[0]*ty-q[1]*tx];
  };
  const local=rig.nodes.map(n=>({p:[...(n.translation||[0,0,0])],q:[...(n.rotation||[0,0,0,1])]}));
  if(!bindPose){
    const clip=rig.clips[state],t=((time%clip.duration)+clip.duration)%clip.duration;
    for(const c of clip.channels){
      const width=c.path==='rotation'?4:3;
      let i=0;while(i<c.times.length-2&&c.times[i+1]<=t)i++;
      const f=(t-c.times[i])/(c.times[i+1]-c.times[i]);
      const a=Array.from(c.values.slice(i*width,(i+1)*width)),b=Array.from(c.values.slice((i+1)*width,(i+2)*width));
      let v;
      if(width===4){
        let dot=a.reduce((n,x,k)=>n+x*b[k],0);if(dot<0){for(let k=0;k<4;k++)b[k]*=-1;dot=-dot;}
        const angle=Math.acos(Math.min(1,dot)),s=Math.sin(angle);
        v=s<.001?a.map((x,k)=>x+(b[k]-x)*f):a.map((x,k)=>(x*Math.sin((1-f)*angle)+b[k]*Math.sin(f*angle))/s);
        const length=Math.hypot(...v);v=v.map(x=>x/length);local[c.node].q=v;
      }else local[c.node].p=a.map((x,k)=>x+(b[k]-x)*f);
    }
  }
  const world=[];
  function transform(i){
    if(world[i])return world[i];
    const l=local[i],parent=rig.parents[i];
    if(parent<0)return world[i]=l;
    const p=transform(parent),offset=rotate(p.q,l.p);
    return world[i]={p:offset.map((x,k)=>x+p.p[k]),q:mul(p.q,l.q)};
  }
  const bones=rig.bones.map(transform),result=new Float32Array(rig.positions.length);
  for(let i=0;i<rig.positions.length/3;i++){
    const x=rig.positions[i*3],y=rig.positions[i*3+1],z=rig.positions[i*3+2];
    for(let k=0;k<4;k++){
      const weight=rig.weights[i*4+k];if(!weight)continue;
      const joint=rig.joints[i*4+k],o=joint*16,m=rig.binds,b=bones[joint];
      const v=[m[o]*x+m[o+4]*y+m[o+8]*z+m[o+12],m[o+1]*x+m[o+5]*y+m[o+9]*z+m[o+13],m[o+2]*x+m[o+6]*y+m[o+10]*z+m[o+14]];
      const p=rotate(b.q,v);for(let axis=0;axis<3;axis++)result[i*3+axis]+=(p[axis]+b.p[axis])*weight;
    }
  }
  return result;
}
