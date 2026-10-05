/* RC137 Persona: screen-left/right ownership in the native isometric plane.
 * Invert both world axes about (19,19), hence both projected screen axes.
 * Only actors are constrained; projectile paths retain native collision.
 */
(function(root){'use strict';
 const guards=new WeakMap(),runs=new WeakMap(),polygons=new Map(),ID='inner-evil-rc133';
 const finite=(x,d=0)=>Number.isFinite(x)?x:d;
 const policy=Object.freeze({centerSum:38,acrossRadius:15,depthRadius:8.3,centerGap:1.45,heroRadius:.8,bossRadius:.8,trackingSeconds:.09,maxSpeed:18});
 const active=s=>root.__HAPIL_INNER_FINAL_RC133__?.encounter?.(s)===true;
 const stats={guards:0,repairs:0,mirrors:0,releases:0,swaps:0};
 const mutual=s=>active(s)&&s.innerFinalRC133.awake>0&&root.__HAPIL_SAMONG_RC91__?.active(s)===true;
 const cooldownFactor=s=>mutual(s)?.5:1;
 const swapped=s=>active(s)&&s.innerFinalRC133.duelSwap===true;
 function tempo(s,dt){const m=s?.innerFinalRC133;if(!mutual(s)){if(m)m.tempoActive=false;return dt;}const step=Math.max(0,Math.min(.1,finite(dt)));if(!m.tempoSeed)m.tempoSeed=(((m.maxHp|0)^(m.hero?.split('').reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0),137)??137))>>>0)||137;if(!m.tempoActive){m.tempoActive=true;m.tempoMutualStart=finite(m.tempoClock);m.duelSwapDone=false;}m.tempoClock=finite(m.tempoClock)+step;const elapsed=m.tempoClock-m.tempoMutualStart,cycle=Math.floor(elapsed/3),phase=elapsed-cycle*3,hash=(Math.imul(m.tempoSeed^(cycle+1),1664525)+1013904223)>>>0,burst=.4+(hash%250)/1000,stop=.05+((hash>>>8)%70)/1000,slow=.55+((hash>>>16)%350)/1000,reburst=.5+((hash>>>24)%150)/1000;let factor=phase<burst?1.3+(hash%20)/100:phase<burst+stop?0:phase<burst+stop+slow?.12:phase<burst+stop+slow+reburst?1.45+((hash>>>8)%15)/100:1;m.tempoFactor=factor;return Math.min(.1,step*factor);}
 function swap(s,on){const m=s.innerFinalRC133,a=s.enemies?.find(a=>a.id===ID);if(!a||!!m.duelSwap===on)return false;const allies=[s,...(root.__HAPIL_PARTY_V31322__?.state===s?root.__HAPIL_PARTY_V31322__.actors??[]:[])],actors=[...allies,a],positions=actors.map(mirror);for(const q of actors)releaseActor(q);m.duelSwap=on;for(let i=0;i<actors.length;i++){actors[i].x=positions[i].x;actors[i].y=positions[i].y;actors[i].navPath=[];for(const k of ['moveDx','moveDy','moveVx','moveVy'])if(Number.isFinite(actors[i][k]))actors[i][k]*=-1;}stats.swaps++;enforce(s);return true;}
 function clip(points,value){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],va=value(a),vb=value(b),inside=va>=-1e-10,next=vb>=-1e-10;if(inside)out.push(a);if(inside!==next){const t=va/(va-vb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
 function polygon(side,radius){const key=side+':'+radius;if(polygons.has(key))return polygons.get(key);
  // Conservative floor ellipse inside the preserved arena's visible platform.
  // Clip its inward edge normals by actor radius, then by native map bounds
  // and the vertical centerline. The right floor is the exact left reflection.
  const source=Array.from({length:64},(_,i)=>{const a=i*Math.PI*2/64,u=Math.cos(a)*policy.acrossRadius,v=Math.sin(a)*policy.depthRadius;return{x:policy.centerSum/2+(v+u)/Math.SQRT2,y:policy.centerSum/2+(v-u)/Math.SQRT2};});
  let result=source.map(p=>({...p}));for(let i=0;i<source.length;i++){const a=source[i],b=source[(i+1)%source.length],dx=b.x-a.x,dy=b.y-a.y,limit=radius*Math.hypot(dx,dy);result=clip(result,p=>dx*(p.y-a.y)-dy*(p.x-a.x)-limit);}
  const hi=Math.min(30.6-radius,policy.centerSum-1.4-radius),lo=policy.centerSum-hi;for(const value of[p=>p.x-lo,p=>hi-p.x,p=>p.y-lo,p=>hi-p.y,p=>side==='left'?p.y-p.x-policy.centerGap:p.x-p.y-policy.centerGap])result=clip(result,value);
  const frozen=Object.freeze(result.map(Object.freeze));polygons.set(key,frozen);return frozen;
 }
 function contains(q,side='left',radius=side==='left'?policy.heroRadius:policy.bossRadius){if(!Number.isFinite(q?.x)||!Number.isFinite(q?.y))return false;const p=polygon(side,radius);return p.length>=3&&p.every((a,i)=>{const b=p[(i+1)%p.length];return(b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x)>=-1e-8;});}
 function point(q,side='left',radius=side==='left'?policy.heroRadius:policy.bossRadius){const p=polygon(side,radius),target={x:finite(q?.x,side==='left'?16:22),y:finite(q?.y,side==='left'?22:16)};if(contains(target,side,radius))return target;
  let best=p[0],distance=Infinity;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((target.x-a.x)*dx+(target.y-a.y)*dy)/(dx*dx+dy*dy||1))),c={x:a.x+t*dx,y:a.y+t*dy},d=(c.x-target.x)**2+(c.y-target.y)**2;if(d<distance){best=c;distance=d;}}return{...best};
 }
 function mirror(q){return{x:policy.centerSum-finite(q?.x,19),y:policy.centerSum-finite(q?.y,19)};}
 function face(s,a){const dx=a.x-s.x,dy=a.y-s.y,h=dx-dy,v=(dx+dy)*.5,dir=Math.abs(h)>Math.abs(v)*1.12?(h<0?'left':'right'):(v<0?'back':'front');s.facing=dx<0?-1:1;s.direction=dir;if(s.heroMotion)s.heroMotion.direction=dir;a.facing=-s.facing;a.direction=dir==='left'?'right':dir==='right'?'left':dir==='back'?'front':'back';}
 function releaseActor(a){const g=guards.get(a);if(!g)return;for(const key of['x','y'])Object.defineProperty(a,key,{...g.original[key],value:g.value[key]});guards.delete(a);stats.releases++;}
 function guard(s,a,side,radius){if(!a)return false;const old=guards.get(a);if(old?.state===s&&old.side===side)return true;if(old)releaseActor(a);
  const original={x:Object.getOwnPropertyDescriptor(a,'x'),y:Object.getOwnPropertyDescriptor(a,'y')};if(!original.x?.configurable||!original.y?.configurable||!Object.hasOwn(original.x,'value')||!Object.hasOwn(original.y,'value'))return false;
  const g={state:s,side,radius,original,value:point(a,side,radius)};guards.set(a,g);
  for(const key of['x','y'])Object.defineProperty(a,key,{configurable:true,enumerable:original[key].enumerable,get(){return g.value[key];},set(v){if(!active(s)){releaseActor(a);a[key]=v;return;}const next=point({...g.value,[key]:finite(v,g.value[key])},side,radius);if(next.x!==v&&key==='x'||next.y!==v&&key==='y')stats.repairs++;g.value=next;}});stats.guards++;return true;
 }
 function set(a,q,side,radius){const g=guards.get(a),p=point(q,side,radius);if(g)g.value=p;else{a.x=p.x;a.y=p.y;}return p;}
 function release(s){const run=runs.get(s);if(!run)return;const undo=s.innerFinalRC133?.duelSwap===true;for(const a of run.actors){const p=undo?mirror(a):null;releaseActor(a);if(p){a.x=p.x;a.y=p.y;}}if(s.innerFinalRC133){s.innerFinalRC133.duelSwap=false;s.innerFinalRC133.tempoActive=false;}runs.delete(s);}
 function enforce(s,spawn=false){if(!active(s)){release(s);return null;}if(swapped(s)&&!mutual(s))swap(s,false);let run=runs.get(s);if(!run){run={actors:new Set()};runs.set(s,run);}
  const allies=[s,...(root.__HAPIL_PARTY_V31322__?.state===s?root.__HAPIL_PARTY_V31322__.actors??[]:[])];for(const a of allies){guard(s,a,swapped(s)?'right':'left',policy.heroRadius);run.actors.add(a);}
  const a=s.enemies?.find(a=>a.id===ID);if(!a)return null;guard(s,a,swapped(s)?'left':'right',policy.bossRadius);run.actors.add(a);delete a.rc133Anchor;delete a.rc133Warp;a.gapChargeV31226=null;
  if(spawn)set(a,mirror(s),swapped(s)?'left':'right',policy.bossRadius);face(s,a);return a;
 }
 function tick(s,dt){const a=enforce(s),party=root.__HAPIL_PARTY_V31322__;if(!a||a.hp<=0||s.hp<=0||s.paused||s.pause||finite(s.timeStopUntil)>s.time||party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return;const m=s.innerFinalRC133,clock=finite(m.tempoClock)-finite(m.tempoMutualStart),at=2+((m.tempoSeed??137)%100)/100;if(mutual(s)&&m.tempoActive&&!m.duelSwap&&!m.duelSwapDone&&clock>=at){swap(s,true);m.duelSwapUntil=clock+.7;m.duelSwapDone=true;}else if(m.duelSwap&&(!mutual(s)||clock>=finite(m.duelSwapUntil)))swap(s,false);if(!(dt>0))return;const t=Math.min(.1,dt),target=point(mirror(s),swapped(s)?'left':'right',policy.bossRadius),amount=1-Math.exp(-t/policy.trackingSeconds),dx=(target.x-a.x)*amount,dy=(target.y-a.y)*amount,d=Math.hypot(dx,dy),limit=d>policy.maxSpeed*t?policy.maxSpeed*t/d:1,old={x:a.x,y:a.y};set(a,{x:a.x+dx*limit,y:a.y+dy*limit},swapped(s)?'left':'right',policy.bossRadius);
  a.moveDx=a.x-old.x;a.moveDy=a.y-old.y;a.moveVx=a.moveDx/t;a.moveVy=a.moveDy/t;a.movingUntil=Math.hypot(a.moveDx,a.moveDy)>1e-6?s.time+.12:0;a.navPath=[];face(s,a);stats.mirrors++;
 }
 // The preserved floor projects inside x=67..1213, y=354..672. Include
 // the humanoid headroom and keep the centerline at the painted view center.
 function camera(s,view={x:0,y:0,width:1280,height:720}){if(!active(s))return null;const scale=Math.min(1.05,Math.max(1,view.width-24)/1200,Math.max(1,view.height-24)/465);return{x:640-640*scale,y:360-462.5*scale,scale,personaMirrorRC134:true};}
 function constrained(s,a){return guards.get(a)?.state===s&&active(s);}
 function backdrop(ctx,canvas){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#020610';ctx.fillRect(0,0,canvas.width,canvas.height);}finally{ctx.restore();}}
 root.__HAPIL_PERSONA_DUEL_RC134__=Object.freeze({version:'RC134',policy,active,mirror,mutual,cooldownFactor,tempo,swapped,swap,polygon,contains,point,guard,enforce,tick,release,camera,constrained,backdrop,metrics:()=>({...stats})});
})(typeof window!=='undefined'?window:globalThis);
