/* RC133: compute contact from the final bitmap draw, before simulation damage.
 * Replays presentation on an isolated transform recorder, never on the live canvas.
 * Decoded images are shared; collision does not depend on a preceding rendered frame.
 */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d;
 function create({render,project,camera,world,alphaBounds,settings,heroDraw,enemyDraw}){
  const scratch=document.createElement('canvas');scratch.width=scratch.height=1;
  const ctx=scratch.getContext('2d'),memo=new WeakMap(),bodies=new WeakMap();let cache=Object.create(null),target=null,boxTarget=null,boxValue=null,boxKey='';
  const stats={plans:0,decoded:0,missing:0,boundsReads:0,personaShapeReuses:0,personaShapeMisses:0};
  function boxKeyFor(canvas){return [canvas.width,canvas.height,root.innerWidth,root.innerHeight,root.devicePixelRatio].join(':');}
  function canvasBounds(canvas,refresh=false){if(!canvas)return null;const key=boxKeyFor(canvas);if(refresh||canvas!==boxTarget||!boxValue||key!==boxKey){boxTarget=canvas;boxValue=canvas.getBoundingClientRect();boxKey=key;stats.boundsReads++;}return boxValue;}
  function observe(canvas,images){if(canvas){target=canvas;canvasBounds(canvas,true);}if(images)cache=images;}
  function measure(s,actor,draw,worldOnly=false){
   const canvas=target??document.querySelector('.game-stage canvas');if(!canvas)return [];
   const loaded=root.__HAPIL_MEDIA_ART_RC133__?.picture(actor.sprite);if(loaded&&!cache[actor.sprite]?.naturalWidth)cache[actor.sprite]=loaded;
   const rows=[],raw=ctx,noop=()=>{};
   const view=new Proxy(Object.create(null),{get(o,k){if(Object.hasOwn(o,k))return o[k];if(k==='canvas')return canvas;
    if(k==='drawImage')return(...args)=>{
     if(args.length!==5&&args.length!==9||raw.globalAlpha<.03)return;
     const im=args[0],iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(!(iw>0&&ih>0))return;
     const bounds=alphaBounds(im);if(!bounds)return;
     const crop=args.length===9?args.slice(1,5):[0,0,iw,ih],dest=args.slice(-4),[sx,sy,sw,sh]=crop,[dx,dy,dw,dh]=dest;
     const l=Math.max(sx,bounds.x),t=Math.max(sy,bounds.y),r=Math.min(sx+sw,bounds.x+bounds.w),b=Math.min(sy+sh,bounds.y+bounds.h);
     if(!(r>l&&b>t&&sw>0&&sh>0&&dw!==0&&dh!==0)||![sx,sy,sw,sh,dx,dy,dw,dh].every(Number.isFinite))return;
     const transform=base.inverse().multiply(raw.getTransform()),at=(x,y)=>{const a=dx+(x-sx)/sw*dw,c=dy+(y-sy)/sh*dh;return{x:transform.a*a+transform.c*c+transform.e,y:transform.b*a+transform.d*c+transform.f};};
     const points=[at(l,t),at(r,t),at(r,b),at(l,b)],area=Math.abs((r-l)/sw*dw*(b-t)/sh*dh*(transform.a*transform.d-transform.b*transform.c));
     if(!(area>1e-6)||!points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))return;
     const box=canvasBounds(canvas),px=box.width/Math.max(1,canvas.width),py=box.height/Math.max(1,canvas.height);
     const screen=[at(l,t),at(r,t),at(r,b),at(l,b)].map(p=>{const q=base.transformPoint(p);return{x:q.x*px,y:q.y*py};});
     const left=Math.min(...screen.map(p=>p.x)),right=Math.max(...screen.map(p=>p.x)),top=Math.min(...screen.map(p=>p.y)),bottom=Math.max(...screen.map(p=>p.y));
     rows.push({points,area,alpha:raw.globalAlpha,path:im.currentSrc||im.src||'',crop:[l,t,r-l,b-t],displayBounds:{left,right,top,bottom,width:right-left,height:bottom-top,longEdge:Math.max(right-left,bottom-top)}});
    };
    if(['fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','putImageData'].includes(k))return noop;
    const v=Reflect.get(raw,k,raw);return typeof v==='function'?v.bind(raw):v;
   },set(o,k,v){if(k==='drawImage'||typeof v==='function'){o[k]=v;return true;}return Reflect.set(raw,k,v,raw);},defineProperty:(o,k,v)=>Reflect.defineProperty(o,k,v),deleteProperty:(o,k)=>Reflect.deleteProperty(o,k)});
   raw.save();let base;try{
    raw.setTransform(n(canvas.width,1280)/1280,0,0,n(canvas.height,720)/720,0,0);raw.globalAlpha=1;raw.filter='none';if(!worldOnly){world?.(view,canvas,s);const cam=camera(s);view.translate(cam.x,cam.y);view.scale(cam.scale??1,cam.scale??1);}base=raw.getTransform();
    draw(view,cache,{...actor},s.time,settings(s));
   }finally{raw.restore();raw.beginPath();}
   stats.plans++;if(rows.length)stats.decoded++;else stats.missing++;return rows;
  }
  function projectileSignature(s,q,canvas,box){
   if(q.rc133InnerShot===true&&q.screenAligned31222===true){
    const opts=settings(s),lod=Math.max(0,Math.min(2,n(opts.projectileLodSmartR1,opts.lowFx?1:2))),born=n(q.sourceBorn,n(q.born)),age=s.time-born,blend=Math.max(0,1-age/.28),previousBlend=Math.max(0,1-(age-.016)/.28),sourceY=n(q.sourceOffsetY,-18),visualY=n(q.visualYV31333,-18),image=cache[q.sprite],cam=camera(s);
    // The native bitmap renderer expands Persona shots to a stable, authored
    // minimum size. Cache only their relative silhouette, keyed by every visual
    // input that can change that silhouette. Spawn lift and its preceding frame
    // remain in the key until the native launch easing is finished.
    return ['rc133-inner-static',s.zone,q.rc133Skill,q.sprite,image?.naturalWidth??image?.width??0,image?.naturalHeight??image?.height??0,
     q.visualScaleV31224??1,q.boss===true,q.midboss===true,q.reflected===true,q.heavyBossSkill===true,q.narrativeAttack===true,q.narrativeGlyph??'',
     q.frozenUntil>s.time,q.visualYV31333??-18,q.sourceOffsetY??-18,
     -18+(sourceY+18)*blend-visualY,-18+(sourceY+18)*previousBlend-visualY,
     lod,opts.lowFx===true,opts.reducedFlash===true,opts.alpha??1,box?.width??0,box?.height??0,canvas?.width??0,canvas?.height??0,cam?.scale??1].join('|');
   }
   return [s,s.time,q.x,q.y,q.sprite,s.hostileProjectiles?.length,box?.width,box?.height,settings(s).lowFx,cache[q.sprite]?.naturalWidth];
  }
  function sameSignature(a,b){return typeof a==='string'?a===b:Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);}
  function projectile(s,q){
   // Recompute when time, position, viewport or population LOD changes.
   const canvas=target??document.querySelector('.game-stage canvas'),box=canvasBounds(canvas),signature=projectileSignature(s,q,canvas,box),prior=memo.get(q);
   if(prior&&sameSignature(prior.signature,signature)){
    if(typeof signature==='string')stats.personaShapeReuses++;
    if(prior.relativeDisplayBounds&&box){const p=project(q.x,q.y),dx=p.x*box.width/Math.max(1,canvas.width),dy=p.y*box.height/Math.max(1,canvas.height),r=prior.relativeDisplayBounds;prior.value.displayBounds={left:r.left+dx,right:r.right+dx,top:r.top+dy,bottom:r.bottom+dy,width:r.width,height:r.height,longEdge:r.longEdge};}
    return prior.value;
   }
   if(typeof signature==='string')stats.personaShapeMisses++;
   const rows=measure(s,q,render),p=project(q.x,q.y),center={x:p.x,y:p.y+n(q.visualYV31333,-18)};
   // A trailing echo, warning icon, aura or Stand is not the main attack body.
   const row=rows.filter(r=>{const x=r.points.reduce((v,p)=>v+p.x,0)/4,y=r.points.reduce((v,p)=>v+p.y,0)/4;return Math.hypot(x-center.x,y-center.y)<180;}).sort((a,b)=>b.area*b.alpha-a.area*a.alpha)[0];
   const value=row?{points:row.points.map(p=>({x:p.x-center.x,y:p.y-center.y})),path:row.path,area:row.area,displayBounds:row.displayBounds}:null;
   let relativeDisplayBounds=null;if(typeof signature==='string'&&value?.displayBounds&&box){const dx=p.x*box.width/Math.max(1,canvas.width),dy=p.y*box.height/Math.max(1,canvas.height),r=value.displayBounds;relativeDisplayBounds={left:r.left-dx,right:r.right-dx,top:r.top-dy,bottom:r.bottom-dy,width:r.width,height:r.height,longEdge:r.longEdge};}
   memo.set(q,{signature,value,relativeDisplayBounds});return value;
  }
  // Presentation envelope only: the established contact measure remains unchanged.
  // Record the native current and raised attack poses before choosing a camera.
  // No live canvas paint or actor HP/position/time writes occur here.
  const envelopes=new Map();
  function paintEnvelope(s,a,isHero){
   const weapon=root.__MONGSE_BALROG_POSE_RC151__?.weapon,key=JSON.stringify([s.zone,a.id,a.activeHeroId,a.heroId,a.sprite,a.currentPhase,a.fixedPhase,a.phaseIndex,a.humanPhase0,a.scale,a.facing,a.maxHp>0?Math.floor(a.hp/a.maxHp*4):0,a.attackAt,a.recoverUntil,a.heroMotion?.kind,a.heroMotion?.until,a.heroMotion?.dx,a.heroMotion?.dy,a.rc133InnerBoss,cache[a.sprite]?.naturalWidth,cache[weapon]?.naturalWidth,root.__HAPIL_MEDIA_ART_RC133__?.ready]);
   const foot=project(a.x,a.y),old=envelopes.get(key);if(old)return{left:foot.x+old.left,right:foot.x+old.right,top:foot.y+old.top,bottom:foot.y+old.bottom,nativePaint:true};
   const clone={...a,hitUntil:0,hitFlashUntil:0},rows=measure(s,clone,isHero?heroDraw:enemyDraw,true);
   if(!isHero)rows.push(...measure(s,{...clone,attackAt:s.time+2,recoverUntil:s.time+2},enemyDraw,true));
   if(!rows.length)return null;
   const points=rows.flatMap(r=>r.points),pad=28,value={left:Math.min(...points.map(p=>p.x))-foot.x-pad,right:Math.max(...points.map(p=>p.x))-foot.x+pad,top:Math.min(...points.map(p=>p.y))-foot.y-pad,bottom:Math.max(...points.map(p=>p.y))-foot.y+pad};
   if(!Object.values(value).every(Number.isFinite))return null;envelopes.set(key,value);while(envelopes.size>96)envelopes.delete(envelopes.keys().next().value);return{left:foot.x+value.left,right:foot.x+value.right,top:foot.y+value.top,bottom:foot.y+value.bottom,nativePaint:true};
  }
  function body(s,a,isHero){const signature=[s,s.time,a.x,a.y,a.activeHeroId??a.heroId,a.sprite,a.heroMotion?.kind,a.heroMotion?.until,a.currentPhase,a.fixedPhase],old=bodies.get(a);if(old?.value&&signature.every((x,i)=>x===old.signature[i]))return old.value;const rows=measure(s,a,isHero?heroDraw:enemyDraw),value=rows.at(-1)??null;bodies.set(a,{signature,value});return value;}
  function enemyContact(s,a,x,y,lift,padding){const row=body(s,a,false);if(!row)return null;const point=project(x,y);point.y+=lift;const points=row.points.map(v=>({x:v.x-point.x,y:v.y-point.y}));return root.__HAPIL_CONTACT_V31336__.classifyPolygonRelative({x:0,y:0},{x:0,y:0},points,padding,padding).hit;}
  return Object.freeze({observe,projectile,body,paintEnvelope,enemyContact,metrics:()=>({...stats})});
 }
 root.__HAPIL_BITMAP_CONTACT_RC133__=Object.freeze({create});
})(window);
