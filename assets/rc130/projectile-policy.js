/* RC130: scoped bitmap size limits and stationary melee presentation.
 * Never patches CanvasRenderingContext2D.prototype, damage, speed or laser geometry.
 * Twenty percent means the longest displayed bitmap bound / shortest battle-canvas side.
 */
(function(root){
 'use strict';
 const finite=(x,d=0)=>typeof x==='number'&&Number.isFinite(x)?x:d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const rects=new WeakMap(),MAX_RATIO=.2;
 const stats={projectileCalls:0,bitmapDraws:0,cappedDraws:0,maxRatio:0,meleeDraws:0,meleeMissing:0,retiredMelee:0};
 function allied(e){return !!(e?.heroSkillVfx||e?.heroProjectileTransient||e?.heroId31213||e?.impactHeroIdV31315||e?.partySlotV31322||e?.canonicalAllyV31217||e?.canonAllyV31217);}
 function hazard(e){return !!(e?.bossLaserCastV31330||e?.laserCastIdV31330||e?.laserTypeV31331||e?.spectacleModeV31317==='beam'||e?.spectacleModeV31317==='blackhole'||e?.blackHole||e?.blackhole||e?.blackHoleV31317||e?.persistentHazard||e?.telegraphImpact&&e?.impactShape==='line');}
 function melee(e){
  if(!e||allied(e)||hazard(e)||e.friendly||e.reflected)return false;
  return e.rc130StationaryMelee===true||e.kind==='enemyAttack'&&e.ranged!==true&&e.distanceMode31222!=='ranged';
 }
 function barrage(e){
  if(!e||allied(e)||hazard(e)||melee(e))return false;
  if(e.telegraphImpact&&!e.bossImpactTransitV31232)return false;
  return !!(e.danmakuV31316||e.bossImpactTransitV31232||e.movingCombatProjectileV31232||e.kind==='enemyProjectile'||e.kind==='projectile'&&(e.sourceId!=null||e.ownershipSourceIdV31322!=null)||Number.isFinite(e.vx)&&Number.isFinite(e.vy));
 }
 function display(ctx){
  const canvas=ctx?.canvas;if(!canvas)return null;
  const t=typeof performance!=='undefined'?performance.now():Date.now();let r=rects.get(canvas);
  if(!r||t-r.at>16){
   const box=canvas.getBoundingClientRect?.();
   const width=finite(box?.width,0)>0?box.width:finite(canvas.width,1280),height=finite(box?.height,0)>0?box.height:finite(canvas.height,720);
   r={at:t,width,height,sx:width/Math.max(1,finite(canvas.width,width)),sy:height/Math.max(1,finite(canvas.height,height)),limit:Math.min(width,height)*MAX_RATIO};rects.set(canvas,r);
  }
  return r;
 }
 function bounds(ctx,w,h){
  const d=display(ctx),m=ctx?.getTransform?.()??{a:1,b:0,c:0,d:1};
  if(!d||![w,h,m.a,m.b,m.c,m.d].every(Number.isFinite))return null;
  return{width:(Math.abs(m.a*w)+Math.abs(m.c*h))*d.sx,height:(Math.abs(m.b*w)+Math.abs(m.d*h))*d.sy,limit:d.limit,side:Math.min(d.width,d.height)};
 }
 function bitmapArgs(ctx,args){
  let a=Array.from(args),offset;
  if(a.length===3){const im=a[0],w=im?.naturalWidth||im?.width,h=im?.naturalHeight||im?.height;if(!(w>0&&h>0))return{args:a};a.push(w,h);}
  if(a.length===5)offset=1;else if(a.length===9)offset=5;else return{args:a};
  const [x,y,w,h]=a.slice(offset),b=bounds(ctx,w,h);if(!b||!(b.side>0))return{args:a};
  const k=Math.min(1,b.limit/Math.max(1e-9,b.width,b.height));
  if(k<1){a[offset]=x+w*(1-k)/2;a[offset+1]=y+h*(1-k)/2;a[offset+2]=w*k;a[offset+3]=h*k;}
  return{args:a,scale:k,ratio:Math.max(b.width,b.height)*k/b.side};
 }
 function projectile(ctx,e,render){
  if(typeof render!=='function')return false;
  if(!barrage(e)||!ctx||typeof ctx.drawImage!=='function')return render();
  stats.projectileCalls++;
  const own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),base=ctx.drawImage;
  ctx.drawImage=function(...args){
   const fit=bitmapArgs(this,args);stats.bitmapDraws++;
   if(fit.scale<1)stats.cappedDraws++;
   if(Number.isFinite(fit.ratio)){stats.maxRatio=Math.max(stats.maxRatio,fit.ratio);e.rc130BitmapRatio=fit.ratio;e.rc130BitmapScale=fit.scale;}
   return base.apply(this,fit.args);
  };
  try{return render();}finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}
 }
 function anchor(e){return{x:finite(e.rc130MeleeX,finite(e.tx,finite(e.x))),y:finite(e.rc130MeleeY,finite(e.ty,finite(e.y)))};}
 function lifetime(e){return clamp(finite(e.duration,.42),.18,.65);}
 function meleePose(e,time,project){
  if(!melee(e)||typeof project!=='function')return null;
  const age=time-finite(e.born),duration=lifetime(e);if(age<0||age>=duration)return null;
  const a=anchor(e),p=project(a.x,a.y);if(!p||![p.x,p.y].every(Number.isFinite))return null;
  const origin=project(finite(e.x,a.x),finite(e.y,a.y));
  return{x:p.x,y:p.y-12,rotation:e.spriteHeading===null?0:Math.atan2(p.y-origin.y,p.x-origin.x)-finite(e.spriteHeading),alpha:clamp((duration-age)/(duration*.4),0,1),duration,age};
 }
 function drawMelee(ctx,cache,e,time,settings={},deps={}){
  if(!melee(e))return false;
  const pose=meleePose(e,time,deps.project);if(!pose)return true;
  const paths=[e.sprite,e.fallbackSprite,'./assets/vfx/generated/v300/slash-impact.webp'];let image=null;
  for(const path of paths){if(!path)continue;const im=deps.queue?.(cache,path,'eager');if(im?.complete&&(im.naturalWidth||im.width)>0&&(im.naturalHeight||im.height)>0){image=im;break;}}
  if(!image){stats.meleeMissing++;return true;}
  const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,size=clamp(finite(e.size,2.2)*26,38,110),k=size/Math.max(iw,ih);
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.filter='none';ctx.globalAlpha*=pose.alpha*(settings.reducedFlash?.7:.9)*clamp(finite(deps.opacity?.(settings),1),0,1);
   ctx.translate(pose.x,pose.y);ctx.rotate(pose.rotation);ctx.drawImage(image,-iw*k/2,-ih*k/2,iw*k,ih*k);
  }finally{ctx.restore();}
  stats.meleeDraws++;e.rc130MeleeLastPose={x:pose.x,y:pose.y,alpha:pose.alpha};return true;
 }
 function prepare(s){
  if(!s||!Array.isArray(s.effects))return;
  for(let i=s.effects.length-1;i>=0;i--){const e=s.effects[i];if(!melee(e))continue;
   if(!Number.isFinite(e.rc130MeleeX)||!Number.isFinite(e.rc130MeleeY)){const p=anchor(e);e.rc130MeleeX=p.x;e.rc130MeleeY=p.y;}
   e.rc130StationaryMelee=true;
   if(s.time-finite(e.born)>=lifetime(e)){s.effects.splice(i,1);stats.retiredMelee++;}
  }
 }
 const api=Object.freeze({version:'RC130',ratio:MAX_RATIO,allied,hazard,melee,barrage,bitmapArgs,projectile,anchor,lifetime,meleePose,drawMelee,prepare,snapshot:()=>({...stats,ratio:MAX_RATIO})});
 root.__HAPIL_PRESENTATION_RC130__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
