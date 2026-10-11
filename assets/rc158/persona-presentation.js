/* RC158: inspected source axes and per-projectile red eclipse presentation. */
(function(root){
 'use strict';
 // Both original eye and lance crops have their head at screen-right and
 // their trailing pixels at screen-left. Symmetric motifs have no head.
 const sourceAxes=Object.freeze({eye:0,lance:0});
 const policy=key=>({spriteHeading:sourceAxes[key]??0,screenAligned31222:!Object.hasOwn(sourceAxes,key)});
 function heading(q,project){
  if(q?.rc133InnerShot!==true||!Object.hasOwn(sourceAxes,q.rc133Skill))return null;
  const vx=Number(q.vx),vy=Number(q.vy);if(!Number.isFinite(vx)||!Number.isFinite(vy)||Math.hypot(vx,vy)<1e-8)return null;
  const a=project(q.x,q.y),b=project(q.x+vx,q.y+vy);
  return Math.atan2(b.y-a.y,b.x-a.x)-sourceAxes[q.rc133Skill];
 }
 const tinted=new WeakMap();let activePicture=null;
 const clean=path=>String(path??'').split(/[?#]/)[0];
 const scopedPicture=path=>activePicture&&clean(path)===activePicture.path?activePicture.picture:null;
 function redPicture(im){
  if(!im?.complete||!im.naturalWidth||!root.document)return null;if(tinted.has(im))return tinted.get(im);
  const canvas=root.document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
  const ctx=canvas.getContext('2d');if(!ctx)return null;ctx.drawImage(im,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),rgba=pixels.data;
  for(let i=0;i<rgba.length;i+=4)if(rgba[i+3]){const light=.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];rgba[i]=Math.max(40,Math.min(255,light*1.55));rgba[i+1]=light*.08;rgba[i+2]=light*.12;}
  ctx.putImageData(pixels,0,0);Object.assign(canvas,{src:im.currentSrc||im.src,complete:true,naturalWidth:canvas.width,naturalHeight:canvas.height,rc158RedEclipse:true});tinted.set(im,canvas);return canvas;
 }
 function withProjectile(cache,q,draw){
  if(q?.rc133InnerShot!==true||q.rc150RedPersonaShot!==true||q.rc133Skill!=='eclipse')return draw();
  const path=q.sprite,own=Object.hasOwn(cache,path),prior=cache[path],source=prior??root.__HAPIL_MEDIA_ART_RC133__?.picture?.(path),picture=redPicture(source);
  if(!picture)return draw();cache[path]=picture;const previous=activePicture;activePicture={path:clean(path),picture};
  try{return draw();}finally{activePicture=previous;if(own)cache[path]=prior;else delete cache[path];}
 }
 root.__HAPIL_PERSONA_PRESENTATION_RC158__=Object.freeze({sourceAxes,policy,heading,redPicture,scopedPicture,withProjectile});
})(typeof window!=='undefined'?window:globalThis);
