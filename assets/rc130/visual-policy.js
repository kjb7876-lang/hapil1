/* RC130: scoped barrage bounds and stationary normal-enemy melee presentation. */
(function(root){'use strict';
 const layouts=new WeakMap(),anchors=new WeakMap();
 const stats={draws:0,cappedDraws:0,meleeDraws:0,meleeExpired:0,meleeExitRejected:0,maxWidthRatio:0,maxHeightRatio:0,geometryCaps:0};
 const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 function barrage(p){return!!p&&!p.friendly&&!p.reflected&&!p.reflectedBySamongRC108&&!p.heroId&&!p.plannedLaserV31330&&!p.laserV31330&&p.shape!=='line'&&(p.danmakuV31316===true||p.codeNativeBarrage31219===true||p.rc126Salvo!=null||p.normalRangedV31237===true);}
 function melee(e){return!!e&&!e.boss&&!e.midboss&&!e.friendly&&!e.heroId&&!e.bloodiedThrownRC43&&!e.bossImpactTransitV31232&&!e.normalRangedV31237&&!e.danmakuVisual&&!e.codeNativeBarrage31219&&!e.plannedLaserV31330&&e.shape!=='line'&&(e.enemyMeleeTelegraphV31237===true||e.normalMonsterEffect===true&&/\/melee-(?:claw|blade|impact)\./i.test(String(e.sprite)));}
 function fit(width,height,m,bounds){
  const w=Math.abs(finite(width)),h=Math.abs(finite(height));
  const a=Math.abs(finite(m?.a,1)),b=Math.abs(finite(m?.b)),c=Math.abs(finite(m?.c)),d=Math.abs(finite(m?.d,1));
  const projectedW=a*w+c*h,projectedH=b*w+d*h;
  const maxW=Math.max(1,finite(bounds?.width,1280))*.2,maxH=Math.max(1,finite(bounds?.height,864))*.2;
  const scale=Math.min(1,projectedW>0?maxW/projectedW:1,projectedH>0?maxH/projectedH:1);
  return{width:w*scale,height:h*scale,scale,projectedWidth:projectedW*scale,projectedHeight:projectedH*scale,maxW,maxH};
 }
 function bounds(canvas){
  const w=Math.max(1,finite(canvas?.width,1280)),h=Math.max(1,finite(canvas?.height,864));
  const mobilePortrait=finite(root.innerWidth,1280)<900&&finite(root.innerHeight,864)>finite(root.innerWidth,1280)*1.06;
  // Each portrait camera pane has its own ceiling, rather than borrowing the other pane's area.
  return{width:w,height:mobilePortrait?h*.5:h};
 }
 function drawProjectile(original,ctx,cache,p,time,settings,...rest){
  if(!barrage(p)||!ctx||typeof ctx.drawImage!=='function')return original(ctx,cache,p,time,settings,...rest);
  const own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),draw=ctx.drawImage;
  let count=0;
  ctx.drawImage=function(...args){
   const o=args.length===9?5:args.length===5?1:-1;if(o<0)return draw.apply(this,args);
   const [x,y,w,h]=args.slice(o),m=typeof this.getTransform==='function'?this.getTransform():{a:1,b:0,c:0,d:1},B=bounds(this.canvas),f=fit(w,h,m,B);
   stats.draws++;count++;stats.maxWidthRatio=Math.max(stats.maxWidthRatio,f.projectedWidth/B.width);stats.maxHeightRatio=Math.max(stats.maxHeightRatio,f.projectedHeight/B.height);
   if(f.scale<1-1e-9){stats.cappedDraws++;args[o]=x+w*(1-f.scale)/2;args[o+1]=y+h*(1-f.scale)/2;args[o+2]=w*f.scale;args[o+3]=h*f.scale;}
   const previous=layouts.get(p);if(!previous||f.scale<previous.scale||previous.time!==time)layouts.set(p,{time,scale:f.scale,halfMinor:Math.min(Math.abs(w),Math.abs(h))*f.scale*.5,widthRatio:f.projectedWidth/B.width,heightRatio:f.projectedHeight/B.height});
   return draw.apply(this,args);
  };
  try{return original(ctx,cache,p,time,settings,...rest);}finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}
 }
 function contactReady(s,p,r){return!barrage(p)||layouts.has(p)||r<=48;}
 function contactRadius(s,p,r){
  if(!barrage(p))return r;const l=layouts.get(p);
  if(l&&l.scale<1){stats.geometryCaps++;return Math.max(0,Math.min(r*l.scale,l.halfMinor));}
  // Before the first decoded draw, do not create an oversized invisible collision radius.
  // Normal footprints are left unchanged; exceptionally large unpainted volumes are provisional.
  if(!l&&r>48){stats.geometryCaps++;return 48;}
  return r;
 }
 function stationary(e,time){
  if(!melee(e))return null;let a=anchors.get(e);if(!a){a={x:finite(e.x),y:finite(e.y),born:finite(e.born,time)};anchors.set(e,a);}
  const duration=Math.max(.08,Math.min(.5,finite(e.enemyRenderLifetimeV31237,finite(e.life,.3)))),age=Math.max(0,finite(time)-a.born);
  if(age>=duration){stats.meleeExpired++;return{expired:true};}
  stats.meleeDraws++;
  return{expired:false,alpha:Math.min(1,(duration-age)/Math.min(.15,duration*.5)),effect:{...e,x:a.x,y:a.y,tx:a.x,ty:a.y,vx:0,vy:0,dx:0,dy:0,moveDx:0,moveDy:0,stationaryMeleeRC130:true}};
 }
 function drawMelee(original,ctx,cache,e,time,settings,...rest){
  const v=stationary(e,time);if(!v)return original(ctx,cache,e,time,settings,...rest);if(v.expired)return false;
  ctx.save();try{ctx.globalAlpha*=v.alpha;return original(ctx,cache,v.effect,time,settings,...rest);}finally{ctx.restore();}
 }
 function capture(original,e,...args){if(melee(e)||e?.stationaryMeleeRC130){stats.meleeExitRejected++;return false;}return original(e,...args);}
 function snapshot(p){return{version:'RC130',stats:{...stats},layout:p?layouts.get(p)||null:null};}
 const api=Object.freeze({version:'RC130',barrage,melee,fit,bounds,drawProjectile,contactReady,contactRadius,stationary,drawMelee,capture,snapshot});root.__HAPIL_VISUAL_RC130__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
