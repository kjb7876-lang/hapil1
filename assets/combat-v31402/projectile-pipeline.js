/* v31402 presentation-only projectile boundary. No collision, HP or PRNG mutation.
 * Visibility is shared with simulation contact gating. Nominal expiry is NOT death.
 */
(function(root){'use strict';
function visible(p,time) {
  if(!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(time))return false;
  if(Number.isFinite(p.born) && p.born>time)return false;
  // expiresAt is nominal in this game: live shots persist until hit/boundary.
  // Do not turn a still-collidable shot invisible when that nominal clock passes.
  if(p.projectileRemovalReason31215 || p.reachedHero31213 || p.reachedMapBoundary31213)return false;
  if(p.hideUntilRelease31219 && time<(Number.isFinite(p.motionReleaseAt31219)?p.motionReleaseAt31219:Infinity))return false;
  if(p.danmakuV31316 && p.bodySpawned31219!==true)return false;
  return true;
}
 function contactEnabled(p,time){
  if(!p)return false;
  if(p.codeNativeBarrage31219&&p.hideUntilRelease31219&&(p.bodySpawned31219!==true||Math.max(Number(p.collisionDisabledUntil31219??-1),Number(p.motionReleaseAt31219??-1))>time))return false;
  if(Number(p.collisionDisabledUntilV31226??0)>time)return false;
  return visible(p,time);
 }
 const FALLBACK='./assets/vfx/v31323/salvage/frost/envy_mirror_shard.webp';
 function create(deps){
  if(!deps||['queue','bindBitmap','angle','project'].some(k=>typeof deps[k]!=='function'))throw Error('Projectile presentation dependency missing');
  const counts={drawCalls:0,suppressedHidden:0,reflected:0,native:0,echo:0};
 function ready(cache,path){
  if(typeof path!=='string'||!path.trim())return null;
  const im=deps.queue(cache,path,'eager');
  return im?.complete&&(im.naturalWidth||im.width)>0&&(im.naturalHeight||im.height)>0?{image:im,path}:null;
 }
 function drawDecoded(ctx,cache,p,time,settings={}){
  p.bitmapRenderedDreamV31353=false;
  deps.bindBitmap(p);
  const nativePath=p.danmakuV31316?p.danmakuArtV31316:null;
  const selected=ready(cache,p.rc126CommonSprite)||ready(cache,nativePath)||ready(cache,p.sprite)||ready(cache,p.fallbackSprite)||ready(cache,FALLBACK);
  if(!selected)return false;
  const im=p.rc126CommonSprite&&selected.path===p.rc126CommonSprite?(root.__HAPIL_COMBAT_SAFETY_RC126__?.tintCommon(selected.image,p.color)??selected.image):selected.image,at=deps.project(p.x,p.y),finite=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
  const scale=Math.max(.7,Math.min(1.6,finite(p.visualScaleV31224,1)));
  const lod=Math.max(0,Math.min(2,finite(settings.projectileLodSmartR1,settings.lowFx?1:2)));
  const extent=p.danmakuV31316?(p.danmakuRadialV31316?32:40):(lod===0?(p.boss?44:p.midboss?38:30):(p.boss?68:p.midboss?56:50))*scale;
  const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,k=extent/Math.max(iw,ih),width=iw*k,height=ih*k;
  const born=finite(p.danmakuLaunchedAtV31316,finite(p.sourceBorn,finite(p.born,time)));
  const blend=Math.max(0,Math.min(1,1-(time-born)/(p.danmakuV31316 ? .3 : .28)));
  const baseY=finite(p.visualYV31333,-18),lift=baseY+(finite(p.sourceOffsetY,baseY)-baseY)*blend;
  const renderObject=nativePath&&selected.path===nativePath?{...p,sprite:selected.path,spriteHeading:finite(p.danmakuHeadingV31316,finite(p.spriteHeading,0))}:p;
  const angle=p.rc126CommonSprite||p.screenAligned31222||p.danmakuRadialV31316?0:deps.angle(renderObject);
  if(!Number.isFinite(angle))return false;
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha*=.98;ctx.shadowBlur=0;ctx.filter='none';
   ctx.translate(at.x,at.y+lift);ctx.rotate(angle);ctx.drawImage(im,-width/2,-height/2,width,height);
  }finally{ctx.restore();}
  p.bitmapRenderedDreamV31353=true;p.bitmapPathV31355=selected.path;
  p.bitmapFallbackV31355=selected.path===FALLBACK&&selected.path!==p.sprite;
  p.renderedWidthV31355=width;p.renderedHeightV31355=height;
  return true;
 }

  function drawImageOnly(ctx,cache,p,time,settings={}){if(!visible(p,time))return false;return drawDecoded(ctx,cache,p,time,settings);}
  function dispatch(base,receiver,args){const [ctx,cache,p,time,settings={}]=args;
   if(!visible(p,time)){counts.suppressedHidden++;return false;}
   if(p.echoBoltV31368){counts.echo++;return root.__HAPIL_ECHOES_V31368__?.drawBolt(ctx,cache,p,time,settings);}
   counts.drawCalls++;
   if(p.rc126CommonSprite){counts.native++;return drawDecoded(ctx,cache,p,time,settings);}
   const options=root.__HAPIL_MATERIAL_V31362__?.projectileSettings(p,settings)??settings;
   if(p.dreamReflectedV31346||p.hellMirrorV31322||p.dreamMirrorProjectileV31347){counts.reflected++;return drawDecoded(ctx,cache,p,time,options);}
   counts.native++;return base.call(receiver,ctx,cache,p,time,options);
  }
  return Object.freeze({version:'3.14.02-RC1',installed:true,fallback:FALLBACK,visible,contactEnabled,drawImageOnly,dispatch,counters:()=>({...counts}),policy:'Bitmap only; aspect and existing alpha retained; no hostile rings.'});
 }
 root.__HAPIL_PROJECTILE_PIPELINE_V31402__=Object.freeze({version:'3.14.02-RC1',installed:true,visible,contactEnabled,create});
})(typeof window!=='undefined'?window:globalThis);
