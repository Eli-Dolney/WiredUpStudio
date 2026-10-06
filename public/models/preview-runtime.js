import {loadGltfRig,skinGltfRig} from "./gltf-rig-reader.js";
export function startPreview(DATA,PACK){
const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});
if(!gl)throw new Error('This preview needs WebGL enabled in the browser.');
const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
const program=gl.createProgram();
gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 aPosition;attribute vec3 aColor;uniform float uAspect;uniform float uScale;uniform float uYaw;uniform float uTilt;uniform float uCenter;varying vec3 color;void main(){vec3 p=aPosition;p.y-=uCenter;float x=cos(uYaw)*p.x+sin(uYaw)*p.z;float z=-sin(uYaw)*p.x+cos(uYaw)*p.z;float y=cos(uTilt)*p.y+sin(uTilt)*z;float d=sin(uTilt)*p.y-cos(uTilt)*z;gl_Position=vec4(x*uScale/uAspect,y*uScale,-d*.025,1.0);color=aColor;}'));
gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.0);}'));
gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.enable(gl.DEPTH_TEST);
const position=gl.createBuffer(),color=gl.createBuffer();
for(const [name,buffer]of [['aPosition',position],['aColor',color]]){const loc=gl.getAttribLocation(program,name);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(loc);}
const uniform=Object.fromEntries(['Aspect','Scale','Yaw','Tilt','Center'].map(n=>[n,gl.getUniformLocation(program,'u'+n)]));
const ids=Object.keys(DATA),cache={};
let id=ids[0],state='Walk',yaw=.7,tilt=.28,paused=matchMedia("(prefers-reduced-motion: reduce)").matches,time=0,last=0,zoom=1.45,drag=null,frameCount=0;
const linear=v=>v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;
function select(next){id=next;time=0;document.querySelectorAll('[data-animal]').forEach(b=>b.classList.toggle('selected',b.dataset.animal===id));const d=DATA[id].meta;document.querySelector('#animalTitle').textContent=d.displayName;document.querySelector('#details').textContent=`${d.triangles.toLocaleString()} triangles / ${DATA[id].rig.Bones.length} bones / ${d.target.size} studs ${{x:'wide',y:'tall',z:'long'}[d.target.axis]}`;document.querySelector('#medium').textContent=d.medium==='water'?'Water surface shown in blue':PACK==='arctic'?'Ground level shown in snow':PACK==='ember'?'Ground level shown in basalt; ember markings are surface colors':'Ground level shown in sand';}
document.querySelector('#zoom').value=zoom;
for(const name of ids){const b=document.createElement('button');b.dataset.animal=name;b.textContent=DATA[name].meta.displayName;b.onclick=()=>select(name);document.querySelector('#animals').append(b);}
for(const clip of ['Idle','Walk','Flee','Rest','Eat','Drink','Alert']){const b=document.createElement('button');b.textContent=clip;b.classList.toggle('selected',clip===state);b.onclick=()=>{state=clip;time=0;document.querySelectorAll('#clips button').forEach(x=>x.classList.toggle('selected',x===b));};document.querySelector('#clips').append(b);}
document.querySelector('#pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'Play':'Pause';};
document.querySelector('#turn').oninput=e=>yaw=Number(e.target.value);
document.querySelector('#angle').oninput=e=>tilt=Number(e.target.value);
document.querySelector('#zoom').oninput=e=>zoom=Number(e.target.value);
document.querySelector('#timeline').oninput=e=>{paused=true;document.querySelector('#pause').textContent='Play';time=Number(e.target.value)*getRig().clips[state].duration;};
canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.009;tilt=Math.max(-1.5,Math.min(1.5,tilt+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];};
canvas.onpointerup=()=>drag=null;canvas.onpointercancel=()=>drag=null;
function getRig(){return cache[id]||(cache[id]=loadGltfRig(DATA[id].gltf));}
function draw(now){
  const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(!paused&&!document.hidden)time+=dt;
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,2);canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.045,.06,.04,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const rig=getRig(),points=skinGltfRig(rig,state,time),d=DATA[id].meta;
  const extent=Math.max(...d.dimensions)*1.25; const fit=Math.min(1,canvas.width/canvas.height);
  gl.uniform1f(uniform.Aspect,canvas.width/canvas.height);gl.uniform1f(uniform.Scale,1.65/extent*zoom*fit);gl.uniform1f(uniform.Yaw,yaw);gl.uniform1f(uniform.Tilt,tilt);gl.uniform1f(uniform.Center,(d.bounds.min[1]+d.bounds.max[1])/2);
  const floor=d.medium==='ground'?0:d.reference.waterY;
  const vertices=[],colors=[];
  // A frame marks the water surface without hiding the swimming skin.
  const half=extent*.58,thick=.025;
  const add=(a,b,c,rgb)=>{vertices.push(...a,...b,...c);colors.push(...rgb,...rgb,...rgb);};
  for(const axis of [0,2])for(const s of [-1,1]){
    const a=[-half,floor,-half],b=[half,floor,half];a[axis]=s*half;b[axis]=s*half;
    const p=[...a],q=[...b];p[axis]+=thick;q[axis]+=thick;
    add(a,b,p,d.medium==='water'?[.25,.65,.76]:[.68,.65,.51]);add(b,q,p,d.medium==='water'?[.25,.65,.76]:[.68,.65,.51]);
  }
  if(d.medium==='ground'){
    const ground=PACK==='arctic'?[.85,.91,.95]:PACK==='ember'?[.45,.43,.43]:[.82,.81,.71];
    add([-half,0,-half],[half,0,-half],[-half,0,half],ground);
    add([half,0,-half],[half,0,half],[-half,0,half],ground);
  }
  for(let i=0;i<rig.indices.length;i+=3){
    const indices=Array.from(rig.indices.slice(i,i+3)),p=indices.map(v=>Array.from(points.slice(v*3,v*3+3)));
    const a=p[1].map((x,k)=>x-p[0][k]),b=p[2].map((x,k)=>x-p[0][k]);
    const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...n)||1;
    const shade=.72+.28*Math.max(0,(-.4*n[0]+.8*n[1]-.44*n[2])/length);
    for(let k=0;k<3;k++){vertices.push(...p[k]);for(let c=0;c<3;c++)colors.push(linear(rig.colors[indices[k]*4+c])*shade);}
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,position);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,color);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);
  document.querySelector('#timeline').value=(time%rig.clips[state].duration)/rig.clips[state].duration;
  document.querySelector('#status').textContent=`${state==='Walk'&&d.medium==='water'?'Walk / swim':state} · ${(time%rig.clips[state].duration).toFixed(2)}s`;
  window.modelPreview={animal:id,state,frames:++frameCount,vertices:points.length/3,playing:!paused};
  requestAnimationFrame(draw);
}
select(id);document.querySelector('#pause').textContent=paused?'Play':'Pause';requestAnimationFrame(draw);

}