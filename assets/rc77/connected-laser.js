/* RC95: preserve the authored beam texture; bend one continuous strip along contact geometry. */
(() => {
 'use strict';let draws=0,textured=0,continuous=0,triangles=0,cached=0,gpuDraws=0;
 const buffers=new WeakMap(),frames=new WeakMap(),tips=new WeakMap();
 // Mask the owner artwork, rather than drawing a new generic beam. Both caps
 // stay inside the original segment: a softened tip must not close a safe gap.
 function softStrip(image,iw,ih,len,half){
  if(typeof document==='undefined')return null;
  const ratio=Math.max(.1,len/(half*2)),key=Math.round(ratio*32)/32;
  let rows=tips.get(image);if(!rows){rows=new Map();tips.set(image,rows);}if(rows.has(key))return rows.get(key);
  const canvas=document.createElement('canvas');canvas.width=Math.min(2048,Math.max(256,Math.round(256*key)));canvas.height=256;
  const paint=canvas.getContext('2d');if(!paint)return null;
  const w=canvas.width,h=canvas.height,r=Math.min(h*.5,w*.5),fade=Math.min(w*.24,h*.65);
  paint.drawImage(image,iw*.25,ih*.25,iw*.5,ih*.5,0,0,w,h);
  paint.globalCompositeOperation='destination-in';paint.beginPath();
  paint.moveTo(r,0);paint.lineTo(w-r,0);paint.quadraticCurveTo(w,0,w,r);paint.lineTo(w,h-r);paint.quadraticCurveTo(w,h,w-r,h);paint.lineTo(r,h);paint.quadraticCurveTo(0,h,0,h-r);paint.lineTo(0,r);paint.quadraticCurveTo(0,0,r,0);paint.fill();
  const end=paint.createLinearGradient(0,0,w,0);end.addColorStop(0,'rgba(0,0,0,0)');end.addColorStop(fade/w,'#000');end.addColorStop(1-fade/w,'#000');end.addColorStop(1,'rgba(0,0,0,0)');paint.fillStyle=end;paint.fillRect(0,0,w,h);
  const edge=paint.createLinearGradient(0,0,0,h);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(.16,'#000');edge.addColorStop(.84,'#000');edge.addColorStop(1,'rgba(0,0,0,0)');paint.fillStyle=edge;paint.fillRect(0,0,w,h);
  rows.set(key,canvas);if(rows.size>16)rows.delete(rows.keys().next().value);return canvas;
 }
 const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
 const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<.75;
 const complexType=type=>!!type&&!['one','sweep'].includes(type);
 function paths(lines){
  const result=[];let current=null;
  for(const l of lines){
   const tail=current?.[current.length-1];
   if(tail&&near(tail,l.a))current.push(l.b);
   else if(tail&&near(tail,l.b))current.push(l.a);
   else{current=[l.a,l.b];result.push(current);}
  }return result;
 }
 function mesh(chain,half){
  const points=[chain[0]],lengths=[0];let total=0;
  for(let i=1;i<chain.length;i++){
   const a=points[points.length-1],b=chain[i],length=Math.hypot(b.x-a.x,b.y-a.y);
   if(length<.01)continue;
   total+=length;points.push(b);lengths.push(total);
  }
  if(points.length<2)return [];
  return points.map((p,i)=>{
   const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
   const dx0=p.x-before.x,dy0=p.y-before.y,l0=Math.hypot(dx0,dy0);
   const dx1=after.x-p.x,dy1=after.y-p.y,l1=Math.hypot(dx1,dy1);
   const n0=l0?{x:-dy0/l0,y:dx0/l0}:{x:-dy1/l1,y:dx1/l1};
   const n1=l1?{x:-dy1/l1,y:dx1/l1}:n0;
   let nx=n0.x+n1.x,ny=n0.y+n1.y,nl=Math.hypot(nx,ny);
   if(nl<.01){nx=n1.x;ny=n1.y;nl=1;}
   nx/=nl;ny/=nl;
   // Keep every edge inside the same half-width contact envelope.
   const spread=half;
   return{u:lengths[i]/total,center:p,half,length:total,left:{x:p.x+nx*spread,y:p.y+ny*spread},right:{x:p.x-nx*spread,y:p.y-ny*spread}};
  });
 }
 function triangle(ctx,image,s,d){
  const det=(s[1].x-s[0].x)*(s[2].y-s[0].y)-(s[2].x-s[0].x)*(s[1].y-s[0].y);
  if(Math.abs(det)<1e-8)return;
  const x1=s[1].x-s[0].x,y1=s[1].y-s[0].y,x2=s[2].x-s[0].x,y2=s[2].y-s[0].y;
  const a=((d[1].x-d[0].x)*y2-(d[2].x-d[0].x)*y1)/det;
  const c=((d[2].x-d[0].x)*x1-(d[1].x-d[0].x)*x2)/det;
  const b=((d[1].y-d[0].y)*y2-(d[2].y-d[0].y)*y1)/det;
  const f=((d[2].y-d[0].y)*x1-(d[1].y-d[0].y)*x2)/det;
  ctx.save();try{
   // Slightly overlap adjacent clips to avoid transparent antialias cracks.
   const center={x:(d[0].x+d[1].x+d[2].x)/3,y:(d[0].y+d[1].y+d[2].y)/3};
   ctx.beginPath();d.forEach((p,i)=>{const dx=p.x-center.x,dy=p.y-center.y,len=Math.hypot(dx,dy)||1,x=p.x+dx/len*.3,y=p.y+dy/len*.3;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.clip();
   ctx.transform(a,b,c,f,d[0].x-a*s[0].x-c*s[0].y,d[0].y-b*s[0].x-f*s[0].y);
   const sx=Math.max(0,Math.min(...s.map(p=>p.x))-.5),sy=Math.max(0,Math.min(...s.map(p=>p.y))-.5);
   const ex=Math.min(image.naturalWidth||image.width,Math.max(...s.map(p=>p.x))+.5),ey=Math.min(image.naturalHeight||image.height,Math.max(...s.map(p=>p.y))+.5);
   ctx.drawImage(image,sx,sy,ex-sx,ey-sy,sx,sy,ex-sx,ey-sy);triangles++;
  }finally{ctx.restore();}
 }
 function gpu(canvas){
  let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,preserveDrawingBuffer:true,premultipliedAlpha:true});}catch{return null;}
  if(!gl)return null;
  const shader=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('beam shader');return sh;};
  try{
   const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 uv;uniform vec4 box;varying vec2 v;void main(){gl_Position=vec4((p.x-box.x)/box.z*2.0-1.0,1.0-(p.y-box.y)/box.w*2.0,0.0,1.0);v=uv;}'),fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D art;void main(){gl_FragColor=texture2D(art,v);}');
   gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('beam program');
   const data=gl.createBuffer(),p=gl.getAttribLocation(program,'p'),uv=gl.getAttribLocation(program,'uv'),box=gl.getUniformLocation(program,'box'),art=gl.getUniformLocation(program,'art'),textures=new Map(),maximum=gl.getExtension('EXT_blend_minmax');
   return{gl,paint(image,meshes,target,iw,ih){
    if(gl.isContextLost())return false;
    let texture=textures.get(image);if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);textures.set(image,texture);if(textures.size>8){const first=textures.keys().next().value;gl.deleteTexture(textures.get(first));textures.delete(first);}}
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform4f(box,target.x,target.y,canvas.width/target.scale,canvas.height/target.scale);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(art,0);
    const vertices=[],add=(point,u,y)=>vertices.push(point.x,point.y,.25+Math.max(0,Math.min(1,u))*.5,y);
    for(const chain of meshes){
     for(let i=1;i<chain.length;i++){
      const a=chain[i-1],b=chain[i],dx=b.center.x-a.center.x,dy=b.center.y-a.center.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
      const al={x:a.center.x+nx*a.half,y:a.center.y+ny*a.half},ar={x:a.center.x-nx*a.half,y:a.center.y-ny*a.half},bl={x:b.center.x+nx*b.half,y:b.center.y+ny*b.half},br={x:b.center.x-nx*b.half,y:b.center.y-ny*b.half};
      add(al,a.u,.25);add(bl,b.u,.25);add(ar,a.u,.75);add(bl,b.u,.25);add(br,b.u,.75);add(ar,a.u,.75);triangles+=2;
     }
     if(chain.length<3)continue;
     // Round textured joins avoid folded strip triangles when beam width exceeds curve radius.
     for(let i=0;i<chain.length;i++){
      const a=chain[i],before=chain[Math.max(0,i-1)].center,after=chain[Math.min(chain.length-1,i+1)].center,dx=after.x-before.x,dy=after.y-before.y,len=Math.hypot(dx,dy)||1,tx=dx/len,ty=dy/len;
      for(let j=0;j<16;j++){
       add(a.center,a.u,.5);
       for(const angle of [j*Math.PI/8,(j+1)*Math.PI/8]){const ox=Math.cos(angle)*a.half,oy=Math.sin(angle)*a.half;add({x:a.center.x+ox,y:a.center.y+oy},a.u+(ox*tx+oy*ty)/a.length,.5-(-ox*ty+oy*tx)/a.half*.25);}
       triangles++;
      }
     }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,data);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STREAM_DRAW);gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(p,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.blendEquation(maximum?maximum.MAX_EXT:gl.FUNC_ADD);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);return true;
   }};
  }catch{gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
 }
 function buffer(ctx,vertices){
  if(!vertices.length||typeof document==='undefined'||!ctx.getTransform)return null;
  const pts=vertices.flatMap(v=>[v.left,v.right]);
  const x=Math.floor(Math.min(...pts.map(p=>p.x)))-2,y=Math.floor(Math.min(...pts.map(p=>p.y)))-2;
  const w=Math.ceil(Math.max(...pts.map(p=>p.x))-x)+2,h=Math.ceil(Math.max(...pts.map(p=>p.y))-y)+2;
  const t=ctx.getTransform(),scale=Math.max(.25,Math.min(2,Math.max(Math.hypot(t.a,t.b),Math.hypot(t.c,t.d))));
  if(w*scale>4096||h*scale>4096)return null;
  const owner=ctx.canvas??ctx;let row=buffers.get(owner);if(!row){let canvas=document.createElement('canvas');const accelerated=gpu(canvas);if(!accelerated)canvas=document.createElement('canvas');row={canvas,gpu:accelerated,ctx:accelerated?null:canvas.getContext('2d')};buffers.set(owner,row);}
  if(row.gpu?.gl.isContextLost()||row.ctx?.isContextLost?.()){const canvas=document.createElement('canvas');row={canvas,gpu:null,ctx:canvas.getContext('2d')};buffers.set(owner,row);}
  const width=Math.ceil(w*scale/128)*128,height=Math.ceil(h*scale/128)*128;
  if(row.canvas.width<width)row.canvas.width=width;if(row.canvas.height<height)row.canvas.height=height;
  const target={...row,x,y,w,h,scale};if(row.gpu)return target;
  const paint=row.ctx;paint.setTransform(1,0,0,1,0,0);paint.clearRect(0,0,row.canvas.width,row.canvas.height);
  paint.setTransform(scale,0,0,scale,-x*scale,-y*scale);paint.globalAlpha=1;paint.globalCompositeOperation='source-over';paint.imageSmoothingEnabled=true;paint.imageSmoothingQuality='high';
  return target;
 }
 function render(ctx,source,options={}){
  const lines=(source??[]).filter(l=>l?.a&&l?.b&&[l.a.x,l.a.y,l.b.x,l.b.y].every(Number.isFinite));
  if(!ctx||!lines.length)return false;
  const alpha=Math.max(0,Math.min(1,finite(options.alpha,1))),half=Math.max(1,finite(options.width,7));
  const image=options.image,iw=image?.naturalWidth||image?.width||0,ih=image?.naturalHeight||image?.height||0;
  const hasArt=!!image&&image.complete!==false&&iw>0&&ih>0;
  const joined=paths(lines),compound=options.complex===true||lines.length>1,curved=joined.some(chain=>chain.length>2);
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.setLineDash([]);
   ctx.lineCap='round';ctx.lineJoin='round';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   if(hasArt){
    const sx=iw*.25,sw=iw*.5,sy=ih*.25,sh=ih*.5;
    if(compound&&curved){
     const transform=ctx.getTransform?.(),key=half+'|'+(transform?[transform.a,transform.b,transform.c,transform.d].join(','):'')+'|'+lines.map(l=>[l.a.x,l.a.y,l.b.x,l.b.y].join(',')).join(';');
     const owner=ctx.canvas??ctx,previous=frames.get(owner),reuse=previous?.image===image&&previous.key===key&&!previous.target?.gpu?.gl.isContextLost()&&!previous.target?.ctx?.isContextLost?.();
     const meshes=reuse?null:joined.map(chain=>mesh(chain,half)).filter(v=>v.length>1),target=reuse?previous.target:buffer(ctx,meshes.flat());
     const accelerated=!reuse&&target?.gpu?.paint(image,meshes,target,iw,ih);
     if(reuse)cached++;if(accelerated)gpuDraws++;
     const paint=target?.ctx??ctx;if(!target)paint.globalAlpha=alpha;
     if(!reuse&&!accelerated)for(const v of meshes){
      // The software renderer uses the same segment rectangles and round joins as WebGL.
      // No folded miter strip or hard seam is left at a tight turn.
      for(let i=1;i<v.length;i++){
       const p=v[i-1],q=v[i],dx=q.center.x-p.center.x,dy=q.center.y-p.center.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
       const al={x:p.center.x+nx*half,y:p.center.y+ny*half},ar={x:p.center.x-nx*half,y:p.center.y-ny*half},bl={x:q.center.x+nx*half,y:q.center.y+ny*half},br={x:q.center.x-nx*half,y:q.center.y-ny*half};
       const u0=sx+p.u*sw,u1=sx+q.u*sw;
       triangle(paint,image,[{x:u0,y:sy},{x:u1,y:sy},{x:u0,y:sy+sh}],[al,bl,ar]);
       triangle(paint,image,[{x:u1,y:sy},{x:u1,y:sy+sh},{x:u0,y:sy+sh}],[bl,br,ar]);
      }
      if(v.length<3)continue;
      for(let i=0;i<v.length;i++){
       const p=v[i],before=v[Math.max(0,i-1)].center,after=v[Math.min(v.length-1,i+1)].center,dx=after.x-before.x,dy=after.y-before.y,len=Math.hypot(dx,dy)||1,tx=dx/len,ty=dy/len;
       for(let j=0;j<16;j++){
        const dst=[p.center],src=[{x:sx+p.u*sw,y:sy+sh*.5}];
        for(const angle of [j*Math.PI/8,(j+1)*Math.PI/8]){const ox=Math.cos(angle)*half,oy=Math.sin(angle)*half;dst.push({x:p.center.x+ox,y:p.center.y+oy});src.push({x:sx+Math.max(0,Math.min(1,p.u+(ox*tx+oy*ty)/p.length))*sw,y:sy+sh*(.5-(-ox*ty+oy*tx)/half*.5)});}
        triangle(paint,image,src,dst);
       }
      }
     }
     if(target){frames.set(owner,{key,image,target});ctx.globalAlpha=alpha;ctx.drawImage(target.canvas,0,0,target.w*target.scale,target.h*target.scale,target.x,target.y,target.w,target.h);}
     continuous++;
    }else{
     // Straight branches keep the original owner bitmap and its luminous fringe.
     for(const l of lines){const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,len=Math.hypot(dx,dy);if(len<.5)continue;
      ctx.save();try{ctx.translate(l.a.x,l.a.y);ctx.rotate(Math.atan2(dy,dx));
       const strip=softStrip(image,iw,ih,len,half);
       if(compound&&!options.low){ctx.globalAlpha=alpha*.16;if(strip)ctx.drawImage(strip,0,-half*1.6,len,half*3.2);else ctx.drawImage(image,sx,sy,sw,sh,0,-half*1.6,len,half*3.2);}
       ctx.globalAlpha=alpha;if(strip)ctx.drawImage(strip,0,-half,len,half*2);else ctx.drawImage(image,sx,sy,sw,sh,0,-half,len,half*2);
      }finally{ctx.restore();}
     }
    }
    textured++;
   }else{
    // A loading fallback only; decoded owner artwork always takes precedence.
    ctx.beginPath();for(const chain of joined){ctx.moveTo(chain[0].x,chain[0].y);for(let i=1;i<chain.length;i++)ctx.lineTo(chain[i].x,chain[i].y);}
    ctx.strokeStyle=options.color||'#ab82ed';ctx.globalAlpha=alpha*.16;ctx.lineWidth=half*2;ctx.stroke();
    ctx.globalAlpha=alpha*.55;ctx.lineWidth=half*1.1;ctx.stroke();
    ctx.globalAlpha=alpha*.85;ctx.strokeStyle=options.accent||options.color||'#e6ded0';ctx.lineWidth=half*.38;ctx.stroke();
   }
   draws++;return true;
  }finally{ctx.restore();}
 }
 window.__HAPIL_CONNECTED_LASER_V31377__=Object.freeze({installed:true,version:'RC95',render,paths,mesh,complexType,stats:()=>({draws,textured,continuous,triangles,cached,gpuDraws})});
})();
