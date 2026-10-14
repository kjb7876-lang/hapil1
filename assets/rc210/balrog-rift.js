/* RC210: independent Balrog spatial slash. Normal black-hole policy is unchanged.
 * Ellipse uses projected floor axes; simulation alone owns damage and pull. */
(function(root){'use strict';
 const image='./assets/rc210/balrog-spatial-rift.png',sourceRect=Object.freeze([47,238,2075,246]),runs=new WeakMap(),n=(v,d=0)=>Number.isFinite(v)?v:d;
 const policy=Object.freeze({warning:1.25,active:3.1,tail:.35,cooldown:18,across:6.2,depth:1.6,pullSpeed:3.15,damageMultiplier:6});let deps=null;
 const inside=(h,a)=>{const dx=a.x-h.x,dy=a.y-h.y;return ((dx-dy)/policy.across)**2+(((dx+dy)*.5)/policy.depth)**2<=1;};
 function reset(s){runs.delete(s);s.balrogRiftsRC210=[];}
 function tick(s,dt){if(!s)return;const a=(s.enemies??[]).find(a=>a.id==='dist06-boss'&&a.hp>0&&!a.visualOnly);
  if(!(s.hp>0)||s.zone!=='dist06'||!a){reset(s);return;}let m=runs.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,next:s.time+8,seen:new WeakMap()};runs.set(s,m);s.balrogRiftsRC210=[];}
  const party=root.__HAPIL_PARTY_V31322__,blocked=s.paused||s.pause||deps?.locked?.(s)||n(s.timeStopUntil)>s.time||party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected);
  const elapsed=Math.max(0,s.time-m.time);m.time=s.time;if(blocked||!(dt>0)){for(const h of s.balrogRiftsRC210??[])h.last=s.time;return;}
  const holes=s.balrogRiftsRC210=(s.balrogRiftsRC210??[]).filter(h=>h.zone===s.zone&&h.endAt>s.time);
  if(s.time>=m.next&&!holes.length&&Math.max(n(a.attackAt),n(a.recoverUntil),n(a.atomicCastUntil31210),n(a.phaseTransitionUntil))<=s.time){
   const fireAt=s.time+policy.warning,h={id:s.fxSerial++,sourceId:a.id,zone:s.zone,x:s.x,y:s.y,born:s.time,fireAt,endAt:fireAt+policy.active+policy.tail,last:s.time,actors:new WeakMap()};holes.push(h);m.next=h.endAt+policy.cooldown;
   a.attackStarted=s.time;a.attackAt=a.attackImpactAt=fireAt;a.recoverUntil=fireAt+.35;a.atomicCastUntil31210=fireAt+.35;a.activePattern='발록 공간참';a.activePatternUntil=fireAt+.35;a.rc210RiftSwingAt=fireAt;
  }
  for(const h of holes){const until=Math.min(s.time,h.fireAt+policy.active),from=Math.max(h.last,h.fireAt);h.last=s.time;if(!(until>from)||elapsed>1)continue;
   const base=root.__HAPIL_BOSS_POLICY_RC175__?.config??{dotDamage:1,dotInterval:.5};
   for(const actor of [s,...(party?.state===s?party.actors??[]:[])]){if(!(actor.hp>0)||!inside(h,actor)){h.actors.delete(actor);continue;}let rec=h.actors.get(actor);if(!rec){rec={elapsed:0};h.actors.set(actor,rec);}rec.elapsed+=until-from;
    while(rec.elapsed+1e-9>=base.dotInterval&&actor.hp>0){rec.elapsed-=base.dotInterval;const damage=base.dotDamage*policy.damageMultiplier,packet={id:s.fxSerial++,sourceId:a.id,born:s.time,at:s.time,x:actor.x,y:actor.y,originX:h.x,originY:h.y,shape:'ellipse',damage,boss:true,status:'none',label:'발록 공간참',balrogSpatialRiftRC210:true};if(actor===s)root.__HAPIL_NATIVE_ARENA_RC138__?.bodyDamage(s,damage,actor.x,actor.y,packet);else party?.debug?.allyDamage(s,actor,damage,packet);}
    const dx=h.x-actor.x,dy=h.y-actor.y,d=Math.hypot(dx,dy);if(d>.45&&!(n(actor.invulnerableUntil)>s.time)){const amount=Math.min(d-.35,policy.pullSpeed*Math.min(.1,until-from)*Math.max(.22,Math.min(1,d/5))),to={x:actor.x+dx/d*amount,y:actor.y+dy/d*amount};if(!root.__HAPIL_BATTLE_ARENA_RC138__?.applyPosition(actor,to)){actor.x=to.x;actor.y=to.y;}}
   }
  }
 }
 function draw(ctx,cache,s){if(!deps||!s?.balrogRiftsRC210?.length)return;const im=deps.queue(cache,image,'eager');if(!im?.complete||!im.naturalWidth)return;
  for(const h of s.balrogRiftsRC210){const p=deps.project(h.x,h.y),x=deps.project(h.x+.5,h.y-.5),y=deps.project(h.x+1,h.y+1),rx=Math.abs(x.x-p.x)*policy.across,ry=Math.abs(y.y-p.y)*policy.depth,warn=s.time<h.fireAt,tail=Math.max(0,Math.min(1,(h.endAt-s.time)/policy.tail));
   ctx.save();try{ctx.globalAlpha*=warn?.34:.92*tail;ctx.drawImage(im,...sourceRect,p.x-rx,p.y-ry,rx*2,ry*2);if(warn){ctx.globalAlpha=.65;ctx.strokeStyle='#df9b62';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2);ctx.stroke();}}finally{ctx.restore();}
  }
 }
 root.__HAPIL_BALROG_RIFT_RC210__=Object.freeze({policy,image,sourceRect,inside,tick,draw,reset,bind:d=>{deps=d;}});
})(window);
