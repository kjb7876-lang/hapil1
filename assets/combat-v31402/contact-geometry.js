/* v336 shared geometric evidence. Coordinates are pre-camera projected pixels.
 * Body contact is resolved only after the observed closest approach or actual heart entry.
 * This intentionally never predicts unobserved future bullet motion. */
(function(root){'use strict';
 function create({project,heroes,combat}){
 if(typeof project!=='function'||typeof heroes!=='function')throw Error('Geometry dependency missing');
const P=()=>window.__HAPIL_PARTY_V31322__,C=()=>window.__HAPIL_COMBAT_V31333__,N=(v,d=0)=>Number.isFinite(v)?v:d;
const cfg=Object.freeze({bodyRadius:16,heartRadius:4.5,groundBodyRadius:.42,groundHeartRadius:.12,maxFrame:.28});
const frames=new WeakMap(),zero={x:0,y:0};
const key=(s,a)=>a===s?'__host':String(a.slotId??'__host');
const hero=a=>{if(!a||a.visualOnly)return false;const party=P(),id=String(a.activeHeroId??a.heroId??'');return a===party?.state||party?.actors?.includes(a)||a.isHero===true||a.player===true||a.combatRole==='hero'||heroes().some(h=>String(h.id)===id)||id==='777'||a.heroCode===777||a.code===777;};
function capture(s){if(!s)return;frames.set(s,{zone:s.zone,time:s.time,positions:new Map([s,...(P()?.state===s?P().actors:[])].filter(hero).map(a=>[key(s,a),C().core(a)]))});}
function previous(s,a){const f=frames.get(s);return f&&f.zone===s.zone&&s.time>=f.time&&s.time-f.time<=cfg.maxFrame?f.positions.get(key(s,a))??C().core(a):C().core(a);}
function bullet(q,old=false){const p=project(old?N(q.previousX,q.x):q.x,old?N(q.previousY,q.y):q.y);return{x:p.x,y:p.y+N(q.visualYV31333,-18)};}
function timeCircle(a,b,r){const dx=b.x-a.x,dy=b.y-a.y,A=dx*dx+dy*dy,B=2*(a.x*dx+a.y*dy),cc=a.x*a.x+a.y*a.y-r*r;if(cc<=0)return 0;if(A<1e-12)return Infinity;const D=B*B-4*A*cc;if(D<0)return Infinity;const t=(-B-Math.sqrt(D))/(2*A);return t>=0&&t<=1?t:Infinity;}
function classifyRelative(r0,r1,body,heart){const dx=r1.x-r0.x,dy=r1.y-r0.y,ll=dx*dx+dy*dy,proj=ll?-(r0.x*dx+r0.y*dy)/ll:0,u=Math.max(0,Math.min(1,proj)),d=Math.hypot(r0.x+u*dx,r0.y+u*dy),ht=timeCircle(r0,r1,heart);
 if(Number.isFinite(ht))return{hit:true,heart:true,t:ht,d};
 // Entry at the outer body boundary is provisional. Wait for measured closest approach.
 const passed=ll<1e-12||proj<=1,hit=d<=body&&passed;return{hit,heart:false,t:hit?u:Infinity,d};}
function projectile(s,a,q){if(!hero(a)||C().frozen(s,q)||a.hp<=0)return{hit:false,heart:false,t:Infinity};const now=C().core(a),before=previous(s,a),b0=bullet(q,true),b1=bullet(q),scale=Math.max(1,Math.min(1.5,N(q.visualScaleV31224,1))),physical=Math.max(0,N(q.radius,.2))*27*scale;
 // The bitmap is larger than the old physical radius for many boss weapons.
 // Enclose its active image footprint; release/telegraph gating remains in the projectile pipeline.
 const extent=q.danmakuV31316?(q.danmakuRadialV31316?32:40):q.boss?68:q.midboss?56:50;
 const visual=q.sprite&&!q.narrativeGlyph?
   (String(q.sourceId)==='dist00-boss'?Math.hypot(70,35):extent*Math.SQRT2*.5)*scale-cfg.bodyRadius:0;
 const policy=root.__HAPIL_VISUAL_RC130__,raw=Math.max(physical,visual);
 if(policy?.contactReady(s,q,raw)===false)return{hit:false,heart:false,t:Infinity,d:Infinity,kind:'awaiting-visible-barrage'};
 const r=policy?.contactRadius(s,q,raw)??raw;
 return{...classifyRelative({x:b0.x-before.x,y:b0.y-before.y},{x:b1.x-now.x,y:b1.y-now.y},cfg.bodyRadius+r,cfg.heartRadius+r),kind:'projectile'};}
function stamp(s,a,h,evidence){if(evidence?.kind==='projectile'&&evidence.hit&&!C().piercing(h)&&Number.isFinite(evidence.t)){h.x=N(h.previousX,h.x)+(h.x-N(h.previousX,h.x))*evidence.t;h.y=N(h.previousY,h.y)+(h.y-N(h.previousY,h.y))*evidence.t;}h.heartContactV31336={target:key(s,a),time:s.time,heart:!!evidence?.heart};combat?.captureEvidence(s,a,h,evidence);return h;}
function first(s,q,actors,hostAlive=true){let best=null;for(const a of [...(hostAlive?[s]:[]),...actors]){const k=key(s,a);if(a.hp<=0||C().seen(q,k))continue;const evidence=projectile(s,a,q);if(evidence.hit&&(!best||evidence.t<best.t||evidence.t===best.t&&k<best.key))best={a,t:evidence.t,key:k,evidence};}return best;}
function graze(s,q){const e=projectile(s,s,q),r=cfg.bodyRadius+(root.__HAPIL_VISUAL_RC130__?.contactRadius(s,q,Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1)))??Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1)));return e.d>r&&e.d<=r+19.44;}
function prepareHost(s,q){const e=projectile(s,s,q);if(e.hit)stamp(s,s,q,e);return e.hit;}
function areaDistance(a,h){if(root.__HAPIL_FINITE_NATIVE_RC126__?.handles(h))return root.__HAPIL_FINITE_NATIVE_RC126__.distance(a,h);if(!a||!h||![a.x,a.y,h.x,h.y,h.radius].every(Number.isFinite)||h.radius<0)return Infinity;
 if(h.shape===`donut`&&(!Number.isFinite(h.innerRadius)||h.innerRadius<0||h.innerRadius>h.radius))return Infinity;
 if([`cross`,`line`,`cone`,`fan`,`sector`].includes(h.shape)&&(!Number.isFinite(h.width)||h.width<0))return Infinity;
 const x=a.x-h.x,y=a.y-h.y,r=Math.hypot(x,y),radius=Math.max(0,N(h.radius)),width=Math.max(0,N(h.width));
 if(h.shape==='circle')return r-radius;if(h.shape==='donut')return Math.max(N(h.innerRadius)-r,r-radius);if(h.shape==='safe')return radius-r;
 const box=(x,y,w,l)=>Math.hypot(Math.max(0,Math.abs(x)-w),Math.max(0,Math.abs(y)-l))+Math.min(Math.max(Math.abs(x)-w,Math.abs(y)-l),0);
 if(h.shape==='cross')return Math.min(box(x,y,width,radius),box(y,x,width,radius));
 if(!Number.isFinite(h.originX)||!Number.isFinite(h.originY))return Infinity;
 const ox=h.originX,oy=h.originY,dx=h.x-ox,dy=h.y-oy,len=Math.hypot(dx,dy);if(len<1e-8)return Infinity;
 const u=(a.x-ox)*dx/len+(a.y-oy)*dy/len,v=-(a.x-ox)*dy/len+(a.y-oy)*dx/len;
 if(h.shape==='line')return box(v,u-radius/2,width,radius/2);
 if(['cone','fan','sector'].includes(h.shape)){const rr=Math.hypot(u,v),theta=Math.abs(Math.atan2(v,u));return Math.max(rr-radius,Math.sin(Math.min(Math.PI/2,theta-width))*rr,-u);}
 return Infinity;
}
function area(s,a,h){if(!hero(a)||!h||!Number.isFinite(h.x)||!Number.isFinite(h.y))return{hit:false,heart:false,kind:'none'};const d=areaDistance(a,h);return{hit:d<=cfg.groundBodyRadius,heart:d<=cfg.groundHeartRadius,kind:'ground-area',distance:d};}
function classify(s,a,h){if(!hero(a)||!h||typeof h!=='object')return{hit:false,heart:false,kind:'nonspatial'};const m=h.heartContactV31336;if(m&&m.target===key(s,a)&&Math.abs(m.time-s.time)<1e-6)return{hit:true,heart:m.heart===true,kind:'observed'};
 if(Number.isFinite(h.vx)&&Number.isFinite(h.vy))return projectile(s,a,h);
 // Source-actor objects and script health costs have no attack volume.
 if(h.kind&&!h.shape||h.exitDamageV31327||h.laserV31330)return{hit:true,heart:false,kind:'unmarked'};
 return area(s,a,h);
}
function beam(s,a,segments,width){const p=C().core(a),d=Math.min(...segments.map(g=>C().segmentDistance(p,C().core(g.a),C().core(g.b))));return{hit:d<=width+cfg.bodyRadius,heart:d<=width+cfg.heartRadius,kind:'beam',distance:d};}
function exitEvidence(s,a,body,start,end,old,current){const lo=Math.max(start,body.born),hi=Math.min(end,body.born+body.duration);if(!(hi>lo))return{hit:false,heart:false};const span=Math.max(1e-9,end-start),at=t=>{const f=Math.max(0,Math.min(1,(t-start)/span));return{x:old.x+(current.x-old.x)*f,y:old.y+(current.y-old.y)*f};};
 const point=t=>{const f=Math.max(0,Math.min(1,(t-body.born)/body.flight)),p=project(body.x+body.dx*body.travel*f,body.y+body.dy*body.travel*f),co=Math.cos(body.rotation),si=Math.sin(body.rotation);return{x:p.x+body.bodyCX*co-body.bodyCY*si,y:p.y+body.visualY+body.bodyCX*si+body.bodyCY*co};};
 const p0=point(lo),p1=point(hi),a0=at(lo),a1=at(hi),co=Math.cos(body.rotation),si=Math.sin(body.rotation);
 const test=r=>{const rx=body.bodyW/2+r,ry=body.bodyH/2+r,rel=(p,a)=>{const x=p.x-a.x,y=p.y-a.y;return{x:(x*co+y*si)/rx,y:(-x*si+y*co)/ry};};const v0=rel(p0,a0),v1=rel(p1,a1),dx=v1.x-v0.x,dy=v1.y-v0.y,ll=dx*dx+dy*dy,passed=ll<1e-12||-(v0.x*dx+v0.y*dy)/ll<=1;return {inside:C().segmentDistance(zero,v0,v1)<=1,passed};};const h=test(cfg.heartRadius),b=test(cfg.bodyRadius);return{hit:h.inside||b.inside&&b.passed,heart:h.inside,kind:'exit'};
}
function drawDebug(ctx,s){ctx.save();try{ctx.globalAlpha=.9;ctx.shadowBlur=0;ctx.setLineDash([]);for(const a of [s,...(P()?.state===s?P().actors:[])].filter(hero)){const p=C().core(a);for(const [r,col]of [[cfg.bodyRadius,'#7bddff'],[cfg.heartRadius,'#ff6688']]){ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();}}ctx.strokeStyle='#ff9b75';for(const h of [...s.pendingHits??[],...s.impactQueue??[]]){if(!Number.isFinite(h.x)||!Number.isFinite(h.y))continue;const p=project(h.x,h.y),r=Math.max(0,N(h.radius)),shape=h.shape;ctx.beginPath();if(['circle','donut','safe'].includes(shape)){ctx.ellipse(p.x,p.y,r*27*Math.SQRT2,r*13.5*Math.SQRT2,0,0,Math.PI*2);if(shape==='donut'){ctx.stroke();ctx.beginPath();ctx.ellipse(p.x,p.y,N(h.innerRadius)*27*Math.SQRT2,N(h.innerRadius)*13.5*Math.SQRT2,0,0,Math.PI*2);}}else if(shape==='line'){const dx=h.x-N(h.originX,h.x),dy=h.y-N(h.originY,h.y),len=Math.max(.001,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,w=N(h.width);const points=[[-uy*w,ux*w],[ux*r-uy*w,uy*r+ux*w],[ux*r+uy*w,uy*r-ux*w],[uy*w,-ux*w]];points.forEach((q,i)=>{const g=project(N(h.originX,h.x)+q[0],N(h.originY,h.y)+q[1]);i?ctx.lineTo(g.x,g.y):ctx.moveTo(g.x,g.y);});ctx.closePath();}else if(shape==='cross'){const w=N(h.width),pts=[[-w,-r],[w,-r],[w,-w],[r,-w],[r,w],[w,w],[w,r],[-w,r],[-w,w],[-r,w],[-r,-w],[-w,-w]];pts.forEach((q,i)=>{const g=project(h.x+q[0],h.y+q[1]);i?ctx.lineTo(g.x,g.y):ctx.moveTo(g.x,g.y);});ctx.closePath();}else if(['cone','fan','sector'].includes(shape)){const ox=N(h.originX,h.x),oy=N(h.originY,h.y),o=project(ox,oy),angle=Math.atan2(h.y-oy,h.x-ox),w=N(h.width);ctx.moveTo(o.x,o.y);for(let i=0;i<=32;i++){const a=angle-w+2*w*i/32,g=project(ox+Math.cos(a)*r,oy+Math.sin(a)*r);ctx.lineTo(g.x,g.y);}ctx.closePath();}ctx.stroke();}for(const cast of s.bossLaserCastsV31330??[]){const L=window.__HAPIL_LASERS_V31332__;if(!L?.valid(cast,s.zone))continue;ctx.lineWidth=Math.max(1,cast.width*54);ctx.globalAlpha=.25;for(const g of L.geometry(cast,s.time)){const p=C().core(g.a),q=C().core(g.b);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}ctx.globalAlpha=.9;ctx.lineWidth=1;ctx.strokeStyle='#ffe6a1';for(const q of s.hostileProjectiles??[]){const a=bullet(q,true),b=bullet(q);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}finally{ctx.restore();}}
return Object.freeze({installed:true,version:'3.14.03',cfg,capture,previous,projectile,classifyRelative,first,stamp,prepareHost,graze,classify,area,areaDistance,beam,exitEvidence,drawDebug,hero});
}
 root.__HAPIL_GEOMETRY_V31402__=Object.freeze({version:'3.14.03-RC1',installed:true,create});
})(typeof window!=='undefined'?window:globalThis);
