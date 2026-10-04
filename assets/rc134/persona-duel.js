/* RC134 Persona: screen-left/right ownership in the native isometric plane.
 * A vertical-screen reflection swaps world x/y and keeps projected height.
 * Only actors are constrained; projectile paths retain native collision.
 */
(function(root){'use strict';
 const guards=new WeakMap(),runs=new WeakMap(),polygons=new Map(),ID='inner-evil-rc133';
 const finite=(x,d=0)=>Number.isFinite(x)?x:d;
 const policy=Object.freeze({centerSum:38,acrossRadius:15,depthRadius:8.3,centerGap:1.45,heroRadius:.8,bossRadius:.8,trackingSeconds:.09,maxSpeed:18});
 const active=s=>root.__HAPIL_INNER_FINAL_RC133__?.encounter?.(s)===true;
 const stats={guards:0,repairs:0,mirrors:0,releases:0};
 function clip(points,value){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],va=value(a),vb=value(b),inside=va>=-1e-10,next=vb>=-1e-10;if(inside)out.push(a);if(inside!==next){const t=va/(va-vb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
 function polygon(side,radius){const key=side+':'+radius;if(polygons.has(key))return polygons.get(key);
  // Conservative floor ellipse inside the preserved arena's visible platform.
  // Clip its inward edge normals by actor radius, then by native map bounds
  // and the vertical centerline. The right floor is the exact left reflection.
  const source=Array.from({length:64},(_,i)=>{const a=i*Math.PI*2/64,u=Math.cos(a)*policy.acrossRadius,v=Math.sin(a)*policy.depthRadius;return{x:policy.centerSum/2+(v+u)/Math.SQRT2,y:policy.centerSum/2+(v-u)/Math.SQRT2};});
  let result=source.map(p=>({...p}));for(let i=0;i<source.length;i++){const a=source[i],b=source[(i+1)%source.length],dx=b.x-a.x,dy=b.y-a.y,limit=radius*Math.hypot(dx,dy);result=clip(result,p=>dx*(p.y-a.y)-dy*(p.x-a.x)-limit);}
  const lo=1.4+radius,hi=30.6-radius;for(const value of[p=>p.x-lo,p=>hi-p.x,p=>p.y-lo,p=>hi-p.y,p=>side==='left'?p.y-p.x-policy.centerGap:p.x-p.y-policy.centerGap])result=clip(result,value);
  const frozen=Object.freeze(result.map(Object.freeze));polygons.set(key,frozen);return frozen;
 }
 function contains(q,side='left',radius=side==='left'?policy.heroRadius:policy.bossRadius){if(!Number.isFinite(q?.x)||!Number.isFinite(q?.y))return false;const p=polygon(side,radius);return p.length>=3&&p.every((a,i)=>{const b=p[(i+1)%p.length];return(b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x)>=-1e-8;});}
 function point(q,side='left',radius=side==='left'?policy.heroRadius:policy.bossRadius){const p=polygon(side,radius),target={x:finite(q?.x,side==='left'?16:22),y:finite(q?.y,side==='left'?22:16)};if(contains(target,side,radius))return target;
  let best=p[0],distance=Infinity;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((target.x-a.x)*dx+(target.y-a.y)*dy)/(dx*dx+dy*dy||1))),c={x:a.x+t*dx,y:a.y+t*dy},d=(c.x-target.x)**2+(c.y-target.y)**2;if(d<distance){best=c;distance=d;}}return{...best};
 }
 function releaseActor(a){const g=guards.get(a);if(!g)return;for(const key of['x','y'])Object.defineProperty(a,key,{...g.original[key],value:g.value[key]});guards.delete(a);stats.releases++;}
 function guard(s,a,side,radius){if(!a)return false;const old=guards.get(a);if(old?.state===s&&old.side===side)return true;if(old)releaseActor(a);
  const original={x:Object.getOwnPropertyDescriptor(a,'x'),y:Object.getOwnPropertyDescriptor(a,'y')};if(!original.x?.configurable||!original.y?.configurable||!Object.hasOwn(original.x,'value')||!Object.hasOwn(original.y,'value'))return false;
  const g={state:s,side,radius,original,value:point(a,side,radius)};guards.set(a,g);
  for(const key of['x','y'])Object.defineProperty(a,key,{configurable:true,enumerable:original[key].enumerable,get(){return g.value[key];},set(v){if(!active(s)){releaseActor(a);a[key]=v;return;}const next=point({...g.value,[key]:finite(v,g.value[key])},side,radius);if(next.x!==v&&key==='x'||next.y!==v&&key==='y')stats.repairs++;g.value=next;}});stats.guards++;return true;
 }
 function set(a,q,side,radius){const g=guards.get(a),p=point(q,side,radius);if(g)g.value=p;else{a.x=p.x;a.y=p.y;}return p;}
 function release(s){const run=runs.get(s);if(!run)return;for(const a of run.actors)releaseActor(a);runs.delete(s);}
 function enforce(s,spawn=false){if(!active(s)){release(s);return null;}let run=runs.get(s);if(!run){run={actors:new Set()};runs.set(s,run);}
  const allies=[s,...(root.__HAPIL_PARTY_V31322__?.state===s?root.__HAPIL_PARTY_V31322__.actors??[]:[])];for(const a of allies){guard(s,a,'left',policy.heroRadius);run.actors.add(a);}
  const a=s.enemies?.find(a=>a.id===ID);if(!a)return null;guard(s,a,'right',policy.bossRadius);run.actors.add(a);delete a.rc133Anchor;delete a.rc133Warp;a.gapChargeV31226=null;
  if(spawn)set(a,{x:s.y,y:s.x},'right',policy.bossRadius);return a;
 }
 function tick(s,dt){const a=enforce(s),party=root.__HAPIL_PARTY_V31322__;if(!a||a.hp<=0||s.hp<=0||!(dt>0)||s.paused||s.pause||finite(s.timeStopUntil)>s.time||party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return;const t=Math.min(.1,dt),target=point({x:s.y,y:s.x},'right',policy.bossRadius),amount=1-Math.exp(-t/policy.trackingSeconds),dx=(target.x-a.x)*amount,dy=(target.y-a.y)*amount,d=Math.hypot(dx,dy),limit=d>policy.maxSpeed*t?policy.maxSpeed*t/d:1,old={x:a.x,y:a.y};set(a,{x:a.x+dx*limit,y:a.y+dy*limit},'right',policy.bossRadius);
  a.moveDx=a.x-old.x;a.moveDy=a.y-old.y;a.moveVx=a.moveDx/t;a.moveVy=a.moveDy/t;a.movingUntil=Math.hypot(a.moveDx,a.moveDy)>1e-6?s.time+.12:0;a.navPath=[];stats.mirrors++;
 }
 // The preserved floor projects inside x=67..1213, y=354..672. Include
 // the humanoid headroom and keep the centerline at the painted view center.
 function camera(s,view={x:0,y:0,width:1280,height:720}){if(!active(s))return null;const scale=Math.min(1.05,Math.max(1,view.width-24)/1200,Math.max(1,view.height-24)/465);return{x:640-640*scale,y:360-462.5*scale,scale,personaMirrorRC134:true};}
 function constrained(s,a){return guards.get(a)?.state===s&&active(s);}
 function backdrop(ctx,canvas){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#020610';ctx.fillRect(0,0,canvas.width,canvas.height);}finally{ctx.restore();}}
 root.__HAPIL_PERSONA_DUEL_RC134__=Object.freeze({version:'RC134',policy,active,polygon,contains,point,guard,enforce,tick,release,camera,constrained,backdrop,metrics:()=>({...stats})});
})(typeof window!=='undefined'?window:globalThis);
