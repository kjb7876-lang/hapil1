/* RC206: separate time-staggered travelling rounds before their warning/release.
 * No packets, damage, speed, release clocks, lifetime or terminal policies added. */
(function(root){'use strict';
 const number=(v,d=0)=>Number.isFinite(v)?v:d,angle=q=>Math.atan2(q.vy,q.vx),delta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
 const worlds=new WeakMap(),stats={examined:0,spread:0,owners:{},scopes:{}};
 const terminal=q=>q.friendly||q.reflected||q.dreamReflectedV31346||q.cancelled||q.parriedV31356||q.deflectedBySkill31211||q.projectileRemovalReason31215||q.reachedHero31213||q.reachedMapBoundary31213;
 const release=q=>Math.max(number(q.born),number(q.frozenUntil),number(q.motionReleaseAt31219),number(q.telegraphUntil31210),number(q.collisionDisabledUntil31219),number(q.collisionDisabledUntilV31226));
 function serial(s){if(!s||!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return;
  let world=worlds.get(s);if(!world||world.zone!==s.zone||s.time<world.time){world={zone:s.zone,time:s.time,seen:new WeakSet(),actors:new WeakMap()};worlds.set(s,world);}world.time=s.time;
  for(const a of s.enemies??[])if(!(a.hp>0))world.actors.delete(a);
  const rows=(s.hostileProjectiles??[]).filter(q=>q&&!world.seen.has(q)).sort((a,b)=>release(a)-release(b)||number(a.id)-number(b.id));
  for(const q of rows){const a=(s.enemies??[]).find(a=>a.id===q.sourceId);if(!a||!(a.hp>0)||!(number(q.damage)>0)||q.visualOnly||q.pureTelegraphV31230||q.damageSuppressedV31226||q.heroSkillVfx||q.heroId31213||q.heroProjectileTransient||!(a.boss||a.midboss||a.rc133InnerBoss||a.specialBoss)||terminal(q)||q.rc150PersonaAwakeningShot||q.laserShot||q.laserV31330||q.bloodV31516||q.themeBombV31323||q.themePollutionV31323||q.bossImpactTransitV31232||root.__HAPIL_PRESENTATION_RC130__?.hazard?.(q)||root.__HAPIL_ORTHOGONAL_RC201__?.owns(q)||Math.hypot(number(q.vx),number(q.vy))<=.01)continue;
   const at=release(q);if(s.time>at+.001){world.seen.add(q);continue;}world.seen.add(q);stats.examined++;
   const pattern=q.rc133Skill??q.danmakuPatternIdV31372??q.densePattern3129??q.signatureKind31212??q.label??'basic',scope=[a.currentPhase??a.fixedPhase??a.phaseIndex??'',q.bossCastId31210!=null?'cast:'+q.bossCastId31210+':'+pattern:'pattern:'+pattern].join('|');
   let scopes=world.actors.get(a);if(!scopes){scopes=new Map();world.actors.set(a,scopes);}for(const [key,rs]of scopes)if(!rs.some(r=>at-r.at<=2.8&&r.at<=at))scopes.delete(key);let history=(scopes.get(scope)??[]).filter(r=>at-r.at<=2.8&&r.at<=at);const original=angle(q),ox=number(q.originX,q.x),oy=number(q.originY,q.y),aligned=history.filter(r=>at-r.at>=.001&&Math.abs(delta(original,r.original))<.045&&Math.hypot(ox-r.x,oy-r.y)<2);
   if(aligned.length){const p=root.__HAPIL_COMBAT_LAYOUT_RC153__?.storyProfile?.(a),span=Math.max(.4,Math.min(.85,number(p?.span,1)*.65)),index=aligned.length;let theta=original+(((index*.618033988749895)%1)*2-1)*span;
    // Keep the explicit opening lane of authored danmaku plans unoccupied.
    if(Number.isFinite(q.danmakuAimV31316)&&Number.isFinite(q.danmakuGapV31316)){const aim=q.danmakuAimV31316,gap=q.danmakuGapV31316+.025;if(Math.abs(delta(theta,aim))<gap)theta=original+(delta(original,aim)<0?-1:1)*Math.abs(delta(theta,original));}
    const speed=Math.hypot(q.vx,q.vy);q.vx=Math.cos(theta)*speed;q.vy=Math.sin(theta)*speed;q.rc153ScatterAngle=theta;q.rc206SerialIndex=index;q.rc206SerialScope=scope;q.danmakuAngleV31316=theta;if(Number.isFinite(q.danmakuAimV31316))q.danmakuOffsetV31316=delta(theta,q.danmakuAimV31316);if(Number.isFinite(q.cosmicAngleV31318))q.cosmicAngleV31318=theta;
    q.curve=0;q.sineAmplitude31212=0;q.homingMode31212='none';q.scatterHomingPrepared31211=true;for(const k of ['homeAt31211','homeUntil31211','retargetAt31212','returnAt','returnUntil','orbitUntil31212'])delete q[k];stats.spread++;stats.owners[a.id]=(stats.owners[a.id]??0)+1;stats.scopes[pattern]=(stats.scopes[pattern]??0)+1;
   }
   history.push({at,x:ox,y:oy,original,theta:angle(q)});scopes.set(scope,history.slice(-256));
  }
 }
 root.__HAPIL_COMBAT_REPAIR_RC206__=Object.freeze({serial,release,metrics:()=>JSON.parse(JSON.stringify(stats))});
})(window);
