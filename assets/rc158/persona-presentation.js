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
 function owns(q){return q?.rc133InnerShot===true&&q.sourceId==='inner-evil-rc133';}
 function draw(ctx,cache,q,time,settings,project,opacity){
  if(!owns(q))return false;
  // The dedicated painter must share the native visibility boundary. Nominal expiry alone still keeps live shots visible.
  if(root.__HAPIL_PROJECTILE_PIPELINE_V31402__?.visible(q,time)===false)return true;
  const media=root.__HAPIL_MEDIA_ART_RC133__,path=q.rc158SourceSprite??(q.rc150PersonaAwakeningShot?media?.samongSkills:media?.personaSkills)?.[q.rc133Skill];
  const source=media?.picture(path);if(!source)return true;
  if(q.bodySpawned31219===false||Number(q.frozenUntil??0)>time)return true;
  const image=q.rc150RedPersonaShot&&q.rc133Skill==='eclipse'?redPicture(source):source;if(!image)return true;
  const p=project(q.x,q.y),angle=heading(q,project)??0,size=Math.max(34,Math.min(88,Number(q.radius??.5)*64))*(q.rc150RedPersonaShot?1.2:1),scale=size/Math.max(image.naturalWidth,image.naturalHeight);
  ctx.save();try{ctx.globalAlpha*=Math.max(0,Math.min(1,opacity(settings)));ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.translate(p.x,p.y-18);ctx.rotate(angle);ctx.drawImage(image,-image.naturalWidth*scale/2,-image.naturalHeight*scale/2,image.naturalWidth*scale,image.naturalHeight*scale);}finally{ctx.restore();}
  q.ordnanceBitmapPathV31322=path;q.ordnanceDirectionV31322=angle;return true;
 }
 root.__HAPIL_PERSONA_PRESENTATION_RC158__=Object.freeze({sourceAxes,policy,heading,redPicture,scopedPicture,withProjectile,owns,draw});
})(typeof window!=='undefined'?window:globalThis);
