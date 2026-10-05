/* RC138: native actor ownership; cameras and travelling attacks never own coordinates. */
(function(root){'use strict';
 let native=null;const runs=new WeakMap(),guards=new WeakMap(),arrays=new WeakMap();
 const n=(v,d=0)=>Number.isFinite(v)?v:d,D=()=>root.__HAPIL_PERSONA_DUEL_RC134__;
 const stats={guards:0,repairs:0,releases:0,deaths:0,relocks:0,spawns:0,bodyRejected:0};
 const format=Object.freeze({width:1280,height:720,center:{x:19,y:19},entry:{x:13.8,y:24.2},exit:{x:24.8,y:13.2},playerRadius:.8,enemyRadius:.72,centerGap:1.45,cameraColumns:2,cameraRows:3});
 const enabledZone=z=>!!native?.combat.has(z),enabled=s=>!!s&&enabledZone(s.zone);
 const hostile=a=>!!a&&!a.visualOnly&&!a.friendly&&!a.ally&&!a.neutral&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238;
 const live=a=>hostile(a)&&(n(a.hp)>0||a.revivalPending===true||a.phaseTransitionActive===true);
 function clear(s,z=s?.zone){if(!enabled(s)||z!==s.zone)return false;if(!(s.hp>0)||(s.enemies??[]).some(live))return false;return native.clear(s,z)===true;}
 const locked=s=>enabled(s)&&s.hp>0&&!clear(s);
 const swapped=s=>D()?.swapped(s)===true,side=(s,allied)=>swapped(s)?allied?'right':'left':allied?'left':'right';
 function point(p,which='all',radius=.48){return D().point(p,which,radius);}
 function contains(p,which='all',radius=.48){return D().contains(p,which,radius);}
 function releaseActor(a){const g=guards.get(a);if(!g)return;for(const k of ['x','y'])Object.defineProperty(a,k,{...g.original[k],value:g.value[k]});guards.delete(a);stats.releases++;}
 function release(s){const r=runs.get(s);if(r)for(const a of r.actors)releaseActor(a);}
 function guard(s,a,allied){if(!a||!locked(s))return false;const which=side(s,allied),radius=allied?format.playerRadius:format.enemyRadius,old=guards.get(a);if(old?.state===s&&old.side===which)return true;if(old)releaseActor(a);
  // Persona has its own stronger point-inversion guard. General ownership does
  // not replace it or reinterpret the explicit mutual faction-swap exception.
  if(D()?.constrained(s,a))return true;
  const original={x:Object.getOwnPropertyDescriptor(a,'x'),y:Object.getOwnPropertyDescriptor(a,'y')};if(!original.x?.configurable||!original.y?.configurable||!Object.hasOwn(original.x,'value')||!Object.hasOwn(original.y,'value'))return false;
  const g={state:s,side:which,radius,original,value:point(a,which,radius)};guards.set(a,g);for(const k of ['x','y'])Object.defineProperty(a,k,{configurable:true,enumerable:original[k].enumerable,get(){return g.value[k];},set(v){if(!locked(s)||s.zone!==g.zone&&g.zone){releaseActor(a);a[k]=v;return;}const q=point({...g.value,[k]:n(v,g.value[k])},g.side,g.radius);if(Math.abs(q[k]-v)>1e-7)stats.repairs++;g.value=q;}});g.zone=s.zone;stats.guards++;return true;
 }
 function enroll(s,a,allied=false){if(!a)return a;if(!allied&&!hostile(a))return a;const r=runs.get(s);if(!r)return a;if(!allied){a.rc138Ranged=true;a.rc138BattleZone=s.zone;}
  guard(s,a,allied);r.actors.add(a);stats.spawns++;return a;
 }
 function watch(s,r){if(r.watched)return;r.watched=true;
  const descriptor=Object.getOwnPropertyDescriptor(s,'enemies');if(descriptor?.configurable&&Object.hasOwn(descriptor,'value')){
   let roster;const wrap=value=>{if(!Array.isArray(value))return value;if(arrays.get(value)?.state===s)return value;const proxy=new Proxy(value,{set(list,key,a){if(typeof key==='string'&&/^\d+$/.test(key)&&a&&typeof a==='object')enroll(s,a);list[key]=a;return true;}});arrays.set(proxy,{state:s});for(const a of value)enroll(s,a);return proxy;};roster=wrap(descriptor.value);
   Object.defineProperty(s,'enemies',{configurable:true,enumerable:descriptor.enumerable,get:()=>roster,set:value=>{roster=wrap(value);}});
  }
  const hp=Object.getOwnPropertyDescriptor(s,'hp');if(hp?.configurable&&Object.hasOwn(hp,'value')){let value=hp.value;Object.defineProperty(s,'hp',{configurable:true,enumerable:hp.enumerable,get:()=>value,set(next){const was=value;value=next;if(!(next>0)){release(s);D()?.release(s);if(was>0)stats.deaths++;}else if(!(was>0)){stats.relocks++;enforce(s);}}});}
 }
 function enforce(s){if(!s)return null;let r=runs.get(s);if(!r){r={actors:new Set(),zone:s.zone,watched:false};runs.set(s,r);watch(s,r);}if(r.zone!==s.zone){release(s);r.actors.clear();r.zone=s.zone;}
  if(!locked(s)){release(s);return snapshot(s);}if(D()?.active(s)){release(s);D().enforce(s);}
  enroll(s,s,true);const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s)for(const a of party.actors??[])if(a.hp>0)enroll(s,a,true);
  for(const a of s.enemies??[])if(hostile(a)){enroll(s,a);if(a.hp<=0&&!a.revivalPending)releaseActor(a);}
  return snapshot(s);
 }
 function movement(s,a,q,radius=.48){if(!enabled(s))return q;const allied=a===s||(root.__HAPIL_PARTY_V31322__?.state===s&&(root.__HAPIL_PARTY_V31322__.actors??[]).includes(a));return point(q,locked(s)?side(s,allied):'all',radius);}
 function ranged(s,a,p){if(!enabled(s)||!hostile(a))return p;return {...p,ranged:true,range:Math.max(40,n(p?.range)),preferredMin:7,preferredMax:13,lunge:0,fxKind:'enemyProjectile',shape:'orb',distanceMode31222:'ranged',counterTacticProjectile31229:true,counterTacticMelee31229:false,normalEnemyProjectileV31237:true,normalEnemyMeleeV31237:false,enemyCombatRoleV31237:'ranged',rc138Ranged:true};}
 function bodyPacket(s,p){const rejected=enabled(s)&&!!p&&(String(p.id??'').startsWith('melee:')||p.bodyContact===true||p.bodyContactV31328===true||p.contactOwnerKind==='body');if(rejected)stats.bodyRejected++;return rejected;}
 function camera(s,view={x:0,y:0,width:1280,height:720}){if(!enabled(s))return null;const scale=Math.min(1.05,Math.max(1,view.width-24)/1200,Math.max(1,view.height-24)/465);return{x:640-640*scale,y:360-462.5*scale,scale,battleArenaRC138:true};}
 function coverage(s,slot,project,view){if(!enabled(s))return null;const ally=slot!=='boss',which=side(s,ally),scale=Math.min(.56,Math.max(.35,(view.width-20)/600)),center=which==='left'?340:940;
  const subjects=ally?[s]:(s.enemies??[]).filter(a=>hostile(a)&&a.hp>0);const chosen=subjects.find(a=>a.id===s.targetEnemyId)??subjects[0]??s,p=project(chosen.x,chosen.y);
  // Three continuous vertical coverage bands are internal diagnostics only.
  // There are still exactly two native views and no six-sector map decoration.
  const row=Math.max(0,Math.min(2,Math.floor((p.y-355)/106))),focusY=Math.max(440,Math.min(540,p.y-32));
  return{x:640-center*scale,y:360-focusY*scale,scale,rc138Side:which,rc138Row:row,rc138Coverage:{left:which==='left'?40:620,right:which==='left'?660:1240,top:355,bottom:673}};
 }
 function drawBoundary(ctx,s,project){if(!locked(s))return false;const poly=D().polygon('all',.8).map(p=>project(p.x,p.y)),top=Math.min(...poly.map(p=>p.y)),bottom=Math.max(...poly.map(p=>p.y)),x=project(19,19).x;ctx.save();try{ctx.globalAlpha=.48;ctx.strokeStyle='#c9dce6';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();}finally{ctx.restore();}return true;}
 function snapshot(s){return{version:1,zone:s?.zone,enabled:enabled(s),locked:locked(s),clear:enabled(s)&&clear(s),reason:!enabled(s)?'rest':s.hp<=0?'death-choice':clear(s)?'clear':'combat',playerSide:side(s,true),enemySide:side(s,false),hostiles:(s?.enemies??[]).filter(live).length,entry:{...format.entry},exit:{...format.exit}};}
 function bind(api){native={...api,combat:new Set(api.combat)};}
 root.__HAPIL_BATTLE_ARENA_RC138__=Object.freeze({version:'RC138',format,bind,enabledZone,enabled,hostile,live,clear,locked,side,point,contains,guard,enroll,enforce,release,releaseActor,movement,ranged,bodyPacket,camera,coverage,drawBoundary,snapshot,metrics:()=>({...stats})});
})(typeof window!=='undefined'?window:globalThis);
