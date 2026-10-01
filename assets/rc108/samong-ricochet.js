/* RC108: existing ranged hero strikes travel through enemies and reflect from world walls. */
(()=>{'use strict';
 const worlds=new WeakMap(),STEP=.075,RADIUS=.09,MAX_AGE=12;
 const finite=Number.isFinite,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const distSeg=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,ll=dx*dx+dy*dy,t=ll?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/ll,0,1):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
 function reflected(projectile,dt,contains,enemies=[]){
  if(!projectile||!finite(dt)||dt<=0||typeof contains!=='function')return{hits:[],bounces:0,alive:!!projectile&&!projectile.removed};
  const hits=[],remainingTargets=new Set(enemies.filter(a=>a?.hp>0).map(a=>String(a.id)));
  projectile.inside??=new Set();
  let left=Math.min(.12,dt)*Math.hypot(projectile.vx,projectile.vy),bounces=0,loops=0;
  while(left>1e-7&&projectile.wallHits<7&&loops++<512){
   const speed=Math.hypot(projectile.vx,projectile.vy)||1,ux=projectile.vx/speed,uy=projectile.vy/speed,step=Math.min(STEP,left),a={x:projectile.x,y:projectile.y},b={x:a.x+ux*step,y:a.y+uy*step};
   if(contains(b.x,b.y,RADIUS)){
    projectile.x=b.x;projectile.y=b.y;left-=step;
    for(const enemy of enemies){if(!(enemy?.hp>0))continue;const key=String(enemy.id),radius=Math.max(.3,Number(enemy.hitRadius)||.72)+RADIUS,inside=distSeg(enemy,a,b)<=radius;
     if(inside&&!projectile.inside.has(key))hits.push(enemy);if(inside)projectile.inside.add(key);else projectile.inside.delete(key);
    }
    for(const key of [...projectile.inside])if(!remainingTargets.has(key))projectile.inside.delete(key);
    continue;
   }
   let lo=0,hi=step;for(let i=0;i<20;i++){const mid=(lo+hi)/2;if(contains(a.x+ux*mid,a.y+uy*mid,RADIUS))lo=mid;else hi=mid;}
   const q={x:a.x+ux*lo,y:a.y+uy*lo},eps=.035;let nx=0,ny=0;
   for(let i=0;i<16;i++){const th=i*Math.PI/8;if(!contains(q.x+Math.cos(th)*eps,q.y+Math.sin(th)*eps,RADIUS)){nx+=Math.cos(th);ny+=Math.sin(th);}}
   let nl=Math.hypot(nx,ny);if(nl<1e-6){nx=ux;ny=uy;nl=1;}nx/=nl;ny/=nl;
   // Reflect using the measured local wall normal; a corner is one map contact.
   const dot=projectile.vx*nx+projectile.vy*ny;if(dot>0){nx=-nx;ny=-ny;}
   const d=projectile.vx*nx+projectile.vy*ny;projectile.vx-=2*d*nx;projectile.vy-=2*d*ny;
   projectile.x=q.x+nx*.012;projectile.y=q.y+ny*.012;
   left=Math.max(0,left-lo);projectile.wallHits++;bounces++;
  }
  if(loops>=512||projectile.wallHits>=7)projectile.removed=true;
  return{hits,bounces,alive:!projectile.removed};
 }
 const mobile=()=>window.__HAPIL_MOBILE_V31366__?.enabled?.()===true;
 function contains(s,x,y,r){
  if(!finite(x)||!finite(y)||x<1.4||x>30.6||y<1.4||y>30.6)return false;
  const geo=window.__HAPIL_GEOMETRY_V31345__;
  if(geo?.profile?.(s.zone))return geo.contains(s.zone,x,y,r);
  // Other authored arenas use the native 1.4–30.6 world collision square.
  return x-r>=1.4&&x+r<=30.6&&y-r>=1.4&&y+r<=30.6;
 }
 function setup(s){let m=worlds.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,projectiles:new Map()};worlds.set(s,m);}return m;}
 function visualFor(s,h,target){
  for(const effect of s.effects??[]){
   if(effect?.kind!=='projectile'||effect.imageOnly===false||effect.partySlotV31322)continue;
   const route=(effect.deliveryRoutesV31322??[]).find(r=>String(r.strikeId)===String(h.id)&&String(r.targetId)===String(target.id));
   if(!route||String(effect.deliveryHeroV31322??effect.heroId31213??effect.heroId??'')!==String(h.heroId))continue;
   return{effect,route};
  }
  return null;
 }
 function rangedStrike(h,visual){const shape=String(visual?.effect?.shape??'').toLowerCase();return h?.actionKey==='A'&&h?.ranged===true&&!['hwando','slayer'].includes(h.heroId)&&!['blade','slash','melee','instant'].includes(shape);}
 function prepare(s){
  if(!s||!Array.isArray(s.pendingStrikes))return 0;
  const m=setup(s);m.time=s.time;
  if(s.hp<=0||!s.zone){m.projectiles.clear();return 0;}
  let launched=0;
  for(const h of s.pendingStrikes){
   if(!h||h.samongRicochetHitRC108||h.samongRicochetActiveRC108||!(h.at>s.time)||h.heroId!==s.activeHeroId||!(Number(h.power)>0))continue;
   const A=window.__HAPIL_SAMONG_RC91__;if(A?.active(s)!==true)continue;
   const target=(s.enemies??[]).find(a=>String(a.id)===String(h.targetId)&&a.hp>0);if(!target)continue;
   const v=visualFor(s,h,target);if(!rangedStrike(h,v))continue;
   const route=v.route,span=Math.max(.02,Number(route.at)-Number(route.born)),progress=clamp((s.time-Number(route.born))/span,0,.96),start={x:Number(route.x)+(Number(route.tx)-Number(route.x))*progress,y:Number(route.y)+(Number(route.ty)-Number(route.y))*progress},dx=target.x-start.x,dy=target.y-start.y,distance=Math.hypot(dx,dy);if(distance<.35)continue;
   const delay=Math.max(.04,h.at-s.time),speed=clamp(distance/delay,8,38),key=String(h.id),effect=v.effect;
   const shot={id:key,heroId:h.heroId,actionKey:h.actionKey,targetId:String(h.targetId),zone:s.zone,x:start.x,y:start.y,vx:dx/distance*speed,vy:dy/distance*speed,born:s.time,lastTime:s.time,wallHits:0,inside:new Set(),removed:false,visual:effect,strike:{...h,at:0,samongPowerMultiplierRC108:7,samongRicochetActiveRC108:false,samongRicochetHitRC108:true}};
   effect.samongRicochetVFXRC108=true;effect.samongRicochetShotIdRC108=key;effect.duration=MAX_AGE;
   h.samongRicochetActiveRC108=true;h.samongPowerMultiplierRC108=7;m.projectiles.set(key,shot);launched++;
  }
  for(const [key,p]of [...m.projectiles]){
   if(p.zone!==s.zone||s.time-p.born>MAX_AGE||p.removed){p.removed=true;if(p.visual)p.visual.samongRicochetExpiredRC108=true;m.projectiles.delete(key);continue;}
   const dt=clamp(s.time-p.lastTime,0,.12);p.lastTime=s.time;if(!(dt>0))continue;
   const moved=reflected(p,dt,(x,y,r)=>contains(s,x,y,r),(s.enemies??[]).map(a=>({...a,hitRadius:window.__HAPIL_COMBAT_V31333__?.enemyRadius?.(a)??a.hitRadius})));
   if(p.visual){p.visual.x=p.x;p.visual.y=p.y;p.visual.tx=p.x;p.visual.ty=p.y;p.visual.angle=Math.atan2(p.vy,p.vx);p.visual.samongRicochetExpiredRC108=!moved.alive;}
   for(const target of moved.hits){const hit={...p.strike,id:s.fxSerial++,targetId:String(target.id),at:s.time,zone:s.zone};s.pendingStrikes.push(hit);}
   if(!moved.alive)m.projectiles.delete(key);
  }
  return launched;
 }
 function draw(ctx,cache,e,time,settings={}){
  if(!e?.samongRicochetVFXRC108)return false;if(e.samongRicochetExpiredRC108||time-e.born>MAX_AGE)return true;
  const p=window.__HAPIL_COMBAT_V31333__?.core?.({x:e.x,y:e.y})??{x:640+(e.x-e.y)*27,y:(e.x+e.y)*13.5-42};
  const image=e.sprite?MONGSE_queueImage(cache,e.sprite,'eager'):null,size=mobile()?17:22,angle=Number(e.angle)||0;ctx.save();try{ctx.globalAlpha*=settings.reducedFlash?.82:.96;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;ctx.translate(p.x,p.y);ctx.rotate(angle);if(image?.complete&&(image.naturalWidth||image.width)){ctx.drawImage(image,-size/2,-size/2,size,size);}else{ctx.fillStyle=e.color??'#eafaff';ctx.beginPath();ctx.arc(0,0,size*.32,0,Math.PI*2);ctx.fill();}}finally{ctx.restore();}return true;
 }
 function reset(s){const m=s&&worlds.get(s);if(!m)return false;for(const p of m.projectiles.values())if(p.visual)p.visual.samongRicochetExpiredRC108=true;worlds.delete(s);return true;}
 window.__HAPIL_SAMONG_RICOCHET_RC108__=Object.freeze({version:'RC108',installed:true,prepare,reflected,contains,draw,reset,metrics:s=>({live:worlds.get(s)?.projectiles.size??0}),policy:Object.freeze({onlyNewRangedStrikes:true,worldWallContacts:7,damageOnEntry:true,reentryAfterExit:true,simulationPasses:1,addedTrails:0})});
})();
