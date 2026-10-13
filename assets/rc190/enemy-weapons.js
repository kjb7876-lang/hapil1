/* RC190: explicit asset-owned basic casts. One original attack budget, no dash/body contact. */
(function(root){'use strict';
 const plans=new WeakMap(),visuals=new WeakMap(),sequences=new WeakMap(),epochs=new WeakMap();
 const blades=new Set(['dist01-s1','dist03-s1','dist04-s1','dist05-s1']),mages=new Set(['dist02-m1','dist05-m1','dist06-m1']);
 const finite=Number.isFinite,epoch=s=>epochs.get(s)??0;
 function eligible(s,a){const R=root.__HAPIL_BATTLE_ARENA_RC138__;return !!s&&!!a&&R?.enabled(s)&&R.hostile(a)&&s.hp>0&&a.hp>0&&(s.enemies??[]).includes(a)&&!(a.phaseTransitionUntil>s.time);}
 function sequence(s,a){const q=sequences.get(a);return q?.world===s&&q.zone===s.zone&&q.epoch===epoch(s)?q.count:0;}
 function valid(s,a,p,releasing=false){return !!p&&eligible(s,a)&&p.world===s&&p.zone===s.zone&&p.epoch===epoch(s)&&s.time>=p.started&&a.attackStarted===p.started&&(releasing?a.attackAt===0||a.attackAt===p.fireAt:a.attackAt===p.fireAt);}
 function profile(s,a,p){if(!eligible(s,a))return p;const old=plans.get(a);if(valid(s,a,old))return {...old.profile};if(old)plans.delete(a);
  let mode=null,range=0,halfAngle=0,sprite=null;
  const distance=Math.hypot(s.x-a.x,s.y-a.y);
  if(blades.has(a.id)&&distance<3.6){mode='blade';range=3.6;halfAngle=40*Math.PI/180;sprite='./assets/combat/v31237/enemies/melee-blade.webp';}
  else if(a.id==='l301-boss'&&distance<4){mode='blade';range=4;halfAngle=(Number(a.currentPhase??a.phase??1)>1||a.hp/a.maxHp<=.5?55:36)*Math.PI/180;sprite='./assets/vfx/v31323/boss/l301-boss/sleepless_six_sword_wave.webp';}
  else if(mages.has(a.id)&&Number(p.hitDelay??0)===0&&sequence(s,a)%2===1){mode='rune';range=p.range;}
  if(!mode)return p;
  return {...p,rc190Mode:mode,rc190Range:range,rc190HalfAngle:halfAngle,rc190Sprite:sprite,lunge:0,range,ranged:mode==='rune',counterTacticProjectile31229:false,counterTacticMelee31229:false,normalEnemyProjectileV31237:mode==='rune',normalEnemyMeleeV31237:mode==='blade',preferredMin:mode==='blade'?1.8:p.preferredMin,preferredMax:mode==='blade'?3:p.preferredMax};
 }
 function allowStart(s,a,p,blocked){return !p?.rc190Mode||eligible(s,a)&&!blocked&&Math.hypot(s.x-a.x,s.y-a.y)<p.rc190Range;}
 function begin(s,a,p){if(!eligible(s,a))return false;const count=sequence(s,a);sequences.set(a,{world:s,zone:s.zone,epoch:epoch(s),count:count+1});if(!p?.rc190Mode){plans.delete(a);return false;}
  if(![a.attackStarted,a.attackAt,s.x,s.y,a.x,a.y].every(finite))return false;
  const dx=s.x-a.x,dy=s.y-a.y,d=Math.hypot(dx,dy);if(d<.001)return false;
  plans.set(a,{world:s,zone:s.zone,epoch:epoch(s),started:a.attackStarted,fireAt:a.attackAt,origin:{x:a.x,y:a.y},target:{x:s.x,y:s.y},angle:Math.atan2(dy,dx),profile:{...p},range:p.rc190Range,halfAngle:p.rc190HalfAngle,radius:Math.max(.01,Number(p.hitRadius)||.38),mode:p.rc190Mode,released:false});return true;
 }
 function geometry(p){if(p.mode==='rune')return {shape:'circle',center:{...p.target},radius:p.radius};return {shape:'cone',center:{...p.origin},radius:p.range,angle:p.angle,halfAngle:p.halfAngle};}
 function inside(p,target){if(p.mode==='rune')return Math.hypot(target.x-p.target.x,target.y-p.target.y)<=p.radius;const dx=target.x-p.origin.x,dy=target.y-p.origin.y,d=Math.hypot(dx,dy);return d>.001&&d<=p.range&&(dx*Math.cos(p.angle)+dy*Math.sin(p.angle))/d>=Math.cos(p.halfAngle);}
 function release(s,a,p,phase,api){if(!p?.rc190Mode)return false;const plan=plans.get(a);if(!valid(s,a,plan,true)||plan.released||s.time<plan.fireAt){plans.delete(a);return true;}
  plan.released=true;plan.visualUntil=s.time+.16;visuals.set(a,plan);
  // Native locomotion is already locked during windup. Reject teleports rather than moving a committed attack origin.
  if(Math.hypot(a.x-plan.origin.x,a.y-plan.origin.y)>.2||api.blocked(s.zone,plan.origin,plan.target,.1)){plans.delete(a);visuals.delete(a);return true;}
  api.sound(a,s.zone);
  if(plan.mode==='blade')s.effects.push({id:s.fxSerial++,sourceId:a.id,ownershipSourceIdV31322:a.id,kind:'enemyAttack',rc130StationaryMelee:true,rc130MeleeX:plan.origin.x+Math.cos(plan.angle)*plan.range*.65,rc130MeleeY:plan.origin.y+Math.sin(plan.angle)*plan.range*.65,x:plan.origin.x,y:plan.origin.y,tx:plan.target.x,ty:plan.target.y,born:s.time,duration:.32,color:p.color,accent:p.accent,size:1.7,angle:plan.angle,shape:'slash',sprite:p.rc190Sprite,ranged:false});
  if(inside(plan,s)&&!api.blocked(s.zone,plan.origin,s,.1)){
   const amount=p.damage+(a.elite?2:0)+(a.boss||a.midboss?phase*2:0),packet={id:'weapon:'+a.id+':'+plan.started,sourceId:a.id,born:plan.started,x:plan.mode==='rune'?plan.target.x:plan.origin.x,y:plan.mode==='rune'?plan.target.y:plan.origin.y,originX:plan.origin.x,originY:plan.origin.y,shape:'circle',radius:plan.mode==='rune'?plan.radius:plan.range,boss:!!a.boss,midboss:!!a.midboss,patternSet:a.patternSet,status:p.status,statusValue:p.statusValue,contactOwnerKind:'weapon',rc190Mode:plan.mode};
   if(api.damage(s,amount,plan.origin.x,plan.origin.y,packet))api.status(s,p.status,p.statusValue,p.name);
  }
  return true;
 }
 function reset(s){epochs.set(s,epoch(s)+1);for(const a of s?.enemies??[]){plans.delete(a);visuals.delete(a); }}
 function draw(ctx,s,project){let count=0;for(const a of s?.enemies??[]){const p=plans.get(a)??visuals.get(a);if(!p)continue;const warning=valid(s,a,p),impact=p.released&&eligible(s,a)&&p.world===s&&p.zone===s.zone&&p.epoch===epoch(s)&&s.time<=p.visualUntil;if(!warning&&!impact){plans.delete(a);visuals.delete(a);continue;}
  const g=geometry(p),points=[];if(g.shape==='cone')points.push(g.center);const from=g.shape==='cone'?g.angle-g.halfAngle:0,to=g.shape==='cone'?g.angle+g.halfAngle:Math.PI*2;
  for(let i=0;i<=32;i++){const angle=from+(to-from)*i/32;points.push({x:g.center.x+Math.cos(angle)*g.radius,y:g.center.y+Math.sin(angle)*g.radius});}
  const screen=points.map(v=>project(v.x,v.y));ctx.save();try{ctx.globalAlpha=impact?.55:.55;ctx.strokeStyle=p.profile.color??'#ef805e';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=impact?2:1.5;ctx.setLineDash(impact?[]:[4,3]);ctx.beginPath();screen.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.stroke();ctx.globalAlpha=impact?.18:.08;ctx.fill();}finally{ctx.restore();}count++;
 }return count;}
 root.__HAPIL_ENEMY_WEAPONS_RC190__=Object.freeze({profile,allowStart,begin,release,reset,draw,geometry,inside,inspect:(s,a)=>{const p=plans.get(a);return p&&{valid:valid(s,a,p),mode:p.mode,fireAt:p.fireAt,geometry:geometry(p),released:p.released};}});
})(typeof window!=='undefined'?window:globalThis);
