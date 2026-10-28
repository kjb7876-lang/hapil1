'use strict';
// Actual native packet producer, signature movement and terminal-expiry code.
// The clock, roster placement and boundary-contact observer are CPU fixtures;
// rendered visibility and live RAF admission are checked separately in Chrome.
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {fixture,fn,native}=require('../qa/rc206/native-fixture.cjs');
const acorn=require(require('node:path').join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/rc163-unit-deps/node_modules','acorn'));
const BASE='346bee26788b789168fca50f63f12a09f6869c2d',read=p=>fs.readFileSync(p,'utf8');
const baseline=p=>cp.execFileSync('git',['show',BASE+':'+p],{encoding:'utf8'});
let checks=0;const test=(label,body)=>{body();checks++;console.log('PASS '+label);};
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} ≈ ${b}`);
function setup(mode='STORY',old=false,id='b03-boss',mobile=false){
 const f=fixture(id,1),r=f.root,s=f.s,a=f.a;s.time=100;s.gameModeV31346=mode;s.hp=s.maxHp=240;
 for(const key of ['attackAt','attackImpactAt','activePatternUntil','recoverUntil','readyAt','patternReadyAt','atomicCastUntil31210','phaseTransitionUntil','invulnerableUntil','staggerUntil'])a[key]=0;
 r.__HAPIL_LASERS_V31330__={ranks:new Set([id])};r.__HAPIL_BLOOD_RC16__={canStart:()=>false};if(mobile){r.innerWidth=844;r.innerHeight=390;r.__HAPIL_COMBAT_RC47__={mobile:()=>true};}
 for(const file of ['assets/rc127/combat-policy.js','assets/rc97/choice-patterns.js','assets/rc126/combat-safety.js','assets/rc210/fragments.js','assets/rc210/projectile-balance.js','assets/rc231/combat-lifecycle.js','assets/rc95/combat-flow.js','assets/rc129/danmaku-director.js','assets/combat-v31402/projectile-pipeline.js'])vm.runInContext(old&&['assets/rc231/combat-lifecycle.js','assets/rc95/combat-flow.js'].includes(file)?baseline(file):read(file),r,{filename:file});
 r.H=()=>({id:'inner-evil-rc133',acceptsSkill:()=>true});r.provenance={allow:()=>true,finalizeAdded:(s,start,a,p,apply)=>s.hostileProjectiles.slice(start).forEach(apply)};
 const source=read('assets/rc133/native-install-v2.js.txt'),at=source.indexOf('  const personaBullet='),end=source.indexOf('\n  const personaCast=',at);assert(at>0&&end>at);vm.runInContext(source.slice(at,end),r);
 Object.assign(r,{MONGSE_resumeTemporalLagProjectile31214(){},MONGSE_tickProjectileEgress31215(){},MONGSE_relaxProjectileCurveForTerminalTravel31222(){},MONGSE_steerReturningProjectile(){}});
 vm.runInContext(fn('MONGSE_stepSignatureProjectile31212'),r);
 const api={locked:()=>false,bullet:(...args)=>r.MONGSE_pushThemeProjectile3129(...args)};
 return{...f,r,F:r.__HAPIL_COMBAT_FLOW_RC95__,D:r.__HAPIL_DANMAKU_RC129__,L:r.__HAPIL_COMBAT_LIFECYCLE_RC231__,V:r.__HAPIL_PROJECTILE_PIPELINE_V31402__,api};
}
function simulate(mode,old,mobile=false,id='b03-boss'){
 const f=setup(mode,old,id,mobile),{r,s,a,F,L,V,api}=f,seen=new Map(),cycles=[],samples=[];let maxQueue=0,quiet=0,maxQuiet=0,started=false;
 for(let step=0;step<600;step++){
  s.time=100+step/60;const before=a.rc95BulletCycle??0;F.tick(s,api,1/60);
  if((a.rc95BulletCycle??0)>before){const added=s.hostileProjectiles.filter(q=>!seen.has(q));assert(added.length>0);const release=Math.max(...added.map(q=>L.release(q)));cycles.push({at:s.time,cycle:a.rc95BulletCycle,count:added.length,lastRelease:release,recovery:L.inspect(s,a,'pressure')?.until??L.inspect(s,a)?.until});
   for(const q of added){r.MONGSE_shouldExpireBossProjectile31213(s,q);seen.set(q,{at:s.time,release:L.release(q),damage:q.damage,speed:Math.hypot(q.vx,q.vy),radius:q.radius,expiresAt:q.expiresAt,hardExpiresAt:q.hardExpiresAt31214});}
  }
  let active=0;
  for(const q of s.hostileProjectiles){const rec=seen.get(q);assert(rec);near(L.release(q),rec.release);assert.equal(q.damage,rec.damage);assert.equal(q.expiresAt,rec.expiresAt);assert.equal(q.hardExpiresAt31214,rec.hardExpiresAt);
   if(s.time+1e-9<rec.release){assert(!V.contactEnabled(q,s.time));continue;}
   r.MONGSE_stepSignatureProjectile31212(s,q,1/60);active++;
   // The native rectangular map contact is observed after actual movement;
   // the real native expiry function owns terminal removal, never a test TTL.
   if(q.x<0||q.x>32||q.y<0||q.y>32)q.reachedMapBoundary31213=true;
  }
  s.hostileProjectiles=s.hostileProjectiles.filter(q=>!r.MONGSE_shouldExpireBossProjectile31213(s,q));
  maxQueue=Math.max(maxQueue,s.hostileProjectiles.length);assert(maxQueue<=r.__HAPIL_BULLET_BALANCE_RC210__.admissionCap());
  if(active)started=true;if(started){quiet=active?0:quiet+1/60;maxQuiet=Math.max(maxQuiet,quiet);}samples.push({at:s.time,active,queued:s.hostileProjectiles.length});
 }
 const gaps=cycles.slice(1).map((c,i)=>c.at-cycles[i].lastRelease);
 return{mode,baseline:old,mobile,cap:r.__HAPIL_BULLET_BALANCE_RC210__.admissionCap(),cycles,maxQueue,maxZeroActiveGap:maxQuiet,maxReleaseToNextAnnouncement:Math.max(0,...gaps),first:[...seen.values()].filter(q=>q.at===cycles[0]?.at),samples};
}
const comparison=[];
for(const mode of ['STORY','DREAM'])test('native full-HP '+mode+' salvos retain warning, contact, speed and caps across multiple live cycles',()=>{
 const before=simulate(mode,true),after=simulate(mode,false);assert(before.cycles.length>=3);assert(after.cycles.length>=3);assert(after.cycles.length>=before.cycles.length);
 assert.deepEqual(after.first,before.first,'the first native full salvo retains every authored packet and final warning clock');
 assert(after.maxZeroActiveGap<=before.maxZeroActiveGap+1/60);
 for(let i=1;i<after.cycles.length;i++)assert(after.cycles[i].at>=after.cycles[i-1].recovery-1e-8,'same owner completes its actual pressure release/recovery');
 if(mode==='STORY'){assert(after.cycles.length>before.cycles.length);assert(after.maxReleaseToNextAnnouncement<before.maxReleaseToNextAnnouncement*.7,'remove repeated warning scaling, not native recovery');}
 comparison.push({mode,before:{cycles:before.cycles,maxQueue:before.maxQueue,maxZeroActiveGap:before.maxZeroActiveGap,maxReleaseToNextAnnouncement:before.maxReleaseToNextAnnouncement},after:{cycles:after.cycles,maxQueue:after.maxQueue,maxZeroActiveGap:after.maxZeroActiveGap,maxReleaseToNextAnnouncement:after.maxReleaseToNextAnnouncement}});
});
test('landscape mobile native cycles obey the real40 cap and retain whole salvos under pressure',()=>{
 for(const mode of ['STORY','DREAM']){const before=simulate(mode,true,true),after=simulate(mode,false,true);assert.equal(after.cap,40);assert(after.cycles.length>=3);assert(after.maxQueue<=40);assert(after.cycles.every(c=>c.count===(mode==='STORY'?12:14)));assert.deepEqual(after.first,before.first);assert(after.maxZeroActiveGap<=before.maxZeroActiveGap+1/60);comparison.push({mode,mobile:true,before:{cycles:before.cycles.length,maxQueue:before.maxQueue,maxGap:before.maxReleaseToNextAnnouncement},after:{cycles:after.cycles.length,maxQueue:after.maxQueue,maxGap:after.maxReleaseToNextAnnouncement}});}
});
test('authored midboss retains its own full native salvo and recovery over repeated cycles',()=>{
 for(const mode of ['STORY','DREAM']){const before=simulate(mode,true,false,'mb-dist03'),after=simulate(mode,false,false,'mb-dist03');assert(after.cycles.length>=3);assert(after.cycles.every(c=>c.count===10));assert.deepEqual(after.first,before.first);for(let i=1;i<after.cycles.length;i++)assert(after.cycles[i].at>=after.cycles[i-1].lastRelease+.45-1e-8);comparison.push({mode,role:'midboss',beforeCycles:before.cycles.length,afterCycles:after.cycles.length,maxQueue:after.maxQueue});}
});
test('pressure channel does not write or rescale any native signature reuse deadline',()=>{
 const f=setup(),{s,a,L,F,api}=f;Object.assign(a,{recoverUntil:112,readyAt:114,patternReadyAt:118,themedOrdnanceAt:120,laserReadyAtRC94:121});const before=JSON.stringify(a);
 F.tick(s,api,1/60);assert.equal(a.rc95BulletCycle,1);const expected=JSON.parse(before),actual={...a};delete actual.rc95BulletCycle;delete actual.shmupPatternPlanV31365;assert.deepEqual(actual,expected);
 const p=L.inspect(s,a,'pressure');assert(p.releaseAt>s.time);near(p.until,p.releaseAt+.7);assert.equal(L.ready(s,a),false);s.time=p.until;assert(L.pressureReady(s,a));assert(!L.ready(s,a));
});
test('laser phase admits gap pressure only after every actual major warning/active queue ends',()=>{
 for(const key of ['pendingHits','impactQueue','bossLaserCastsV31330','bossUltimateCastsV31334','cosmicCastsV31318','narrativeCasts','telekineticCasts','spatialRiftCasts']){
  const f=setup(),{s,a,F,L,api}=f;f.r.__HAPIL_DANMAKU_RC129__={...f.D,phase:()=>({index:1,name:'레이저',cycle:0,draining:false}),beforeTick(){}};
  const q={sourceId:a.id,damage:12,at:s.time+1,impactAt:s.time+1,endAt:s.time+2,fireAt:s.time+.5,activeSeconds:1.5};s[key]=[q];const clocks=JSON.stringify(q);const end=L.majorUntil(s,a);
  s.time=end-.001;F.tick(s,api,.001);assert.equal(a.rc95BulletCycle,undefined,key+' remains exclusive until its actual end');assert.equal(JSON.stringify(q),clocks);
  s.time=end;F.tick(s,api,.001);assert.equal(a.rc95BulletCycle,1,key+' completed action permits original native pressure');assert.equal(JSON.stringify(q),clocks);assert.equal(F.snapshot(s).stats.gapFills,1);
 }
});
test('primary native admission still waits for pressure final release and recovery',()=>{
 const f=setup('DREAM'),{s,a,F,L,api}=f;F.tick(s,api,.016);const p=L.inspect(s,a,'pressure');let calls=0;s.time=p.until-.001;assert.equal(L.run(s,a,()=>++calls,'deferred'),'deferred');assert.equal(calls,0);s.time=p.until;assert.equal(L.run(s,a,()=>++calls,'deferred'),1);
});
test('actual native basic decision gate waits pressure, then preserves the original AI result and side effects',()=>{
 const f=setup('DREAM'),{r,s,a,F,L,api}=f;vm.runInContext(fn('MONGSE_shouldBossStartNormalAttackSmartR1'),r);const predicate=r.MONGSE_shouldBossStartNormalAttackSmartR1;let calls=0;r.MONGSE_shouldBossStartNormalAttackSmartR1=(...args)=>{calls++;return predicate(...args);};
 const source=read('assets/rc133/native-install-v2.js.txt'),at=source.indexOf('const lifecycleBasic='),end=source.indexOf('\n',at);assert(at>0);vm.runInContext('(()=>{const lifecycle=window.__HAPIL_COMBAT_LIFECYCLE_RC231__;'+source.slice(at,end)+'})();',r);
 F.tick(s,api,.016);const p=L.inspect(s,a,'pressure');s.time=p.until-.001;assert.equal(r.MONGSE_shouldBossStartNormalAttackSmartR1(s,a,{reactionMax:.3},null),false);assert.equal(calls,0);s.time=p.until;assert.equal(r.MONGSE_shouldBossStartNormalAttackSmartR1(s,a,{reactionMax:.3},null),true);assert.equal(calls,1);
 assert.equal(r.MONGSE_shouldBossStartNormalAttackSmartR1(s,a,{reactionMax:.3},{wall:true}),false);assert.equal(calls,2,'retain the actual native terrain refusal');s.heroMotion={kind:'dash',until:s.time+1};assert.equal(r.MONGSE_shouldBossStartNormalAttackSmartR1(s,a,{reactionMax:.3},null),false);near(a.readyAt,s.time+.16);s.zone='village';delete s.heroMotion;assert.equal(r.MONGSE_shouldBossStartNormalAttackSmartR1(s,a,{reactionMax:.3},null),true);assert.equal(calls,4);
});
test('actual native authored ground cast follows pressure and retains its warning, shape and signature recovery',()=>{
 const f=setup('STORY',false,'mb-dist01'),{r,s,a,F,L,api}=f;Object.assign(r,{b:x=>Math.max(1.4,Math.min(30.6,x)),J:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),Jt:()=>null,pi(){},MONGSE_scheduleWrathBossSequence(){},MONGSE_episodeBossPacing:()=>null});
 const kStart=native.indexOf('\nvar K =')+1,kEnd=native.indexOf('\n  er =',kStart);assert(kStart>0&&kEnd>kStart);vm.runInContext(native.slice(kStart,kEnd).replace(/,\s*$/,';')+'\n'+fn('Ei'),r);const at=native.indexOf('K(`보라검 거미줄 절단`'),cardSource=native.slice(at,native.indexOf('\n      K(',at+1)).replace(/,\s*$/,'');assert(at>0);const node=acorn.parseExpressionAt(cardSource,0,{ecmaVersion:'latest'}),card=vm.runInContext(cardSource.slice(0,node.end),r);assert.equal(card.shape,'cone');
 F.tick(s,api,.016);const pressure=L.inspect(s,a,'pressure');let nativeCasts=0;s.time=pressure.until-.001;L.run(s,a,()=>{nativeCasts++;r.Ei(s,a,card,1);},null);assert.equal(nativeCasts,0);
 s.time=pressure.until;L.run(s,a,()=>{nativeCasts++;r.Ei(s,a,card,1);},null);assert.equal(nativeCasts,1);assert.equal(s.pendingHits.length,1);const hit=s.pendingHits[0],before=JSON.stringify(hit),reuse={recoverUntil:a.recoverUntil,readyAt:a.readyAt,patternReadyAt:a.patternReadyAt};near(hit.at-hit.born,card.windup);assert.equal(hit.shape,card.shape);assert.equal(hit.radius,card.radius);assert.equal(hit.damage,card.damage);
 s.time=hit.at-.001;F.tick(s,api,.001);assert.equal(a.rc95BulletCycle,1);s.time=hit.at+.001;F.tick(s,api,.001);assert.equal(a.rc95BulletCycle,2);assert.equal(JSON.stringify(hit),before);for(const key of Object.keys(reuse))assert.equal(a[key],reuse[key]);assert(!L.ready(s,a),'the signature still observes native recovery');
});
test('ready owner fairness does not wait behind a blocked lead or fragment owner budget',()=>{
 const f=setup('DREAM',false,'mb-dist04'),{s,a,F,L,api,r}=f;const b={...a,id:'second-midboss',atomicCastUntil31210:0,recoverUntil:0};s.enemies.push(b);r.__HAPIL_LASERS_V31330__.ranks.add(b.id);a.atomicCastUntil31210=108;
 F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,undefined);assert.equal(b.rc95BulletCycle,1);
 a.atomicCastUntil31210=0;s.time=Math.max(F.frame(s).nextBullet,L.inspect(s,b,'pressure').until)+.001;F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,1);assert.equal(s.hostileProjectiles.filter(q=>q.sourceId===a.id).length,4);
 const prior=s.hostileProjectiles.filter(q=>q.sourceId===a.id);s.time=Math.max(F.frame(s).nextBullet,L.inspect(s,a,'pressure').until,L.inspect(s,b,'pressure').until)+.001;F.tick(s,api,.016);assert.equal(b.rc95BulletCycle,2);assert.equal(a.rc95BulletCycle,1);assert(prior.every(q=>s.hostileProjectiles.includes(q)));
});
test('native fragment warning remains intact before common stagger and phase warning are added',()=>{
 const f=setup('STORY',false,'mb-dist04'),{s,a,F,L,api}=f;F.tick(s,api,.016);assert.equal(s.hostileProjectiles.length,4);for(const q of s.hostileProjectiles)assert(L.release(q)>=100.65,'do not erase the actual native .65 fragment warning');assert.equal(a.rc95BulletCycle,1);
});
test('native queue-empty Cosmic arsenal retains its exclusive original projectile role',()=>{
 const f=setup('DREAM'),{s,a,F,L,api}=f;a.cosmicLuciferV31318=true;assert.equal(L.pressureReady(s,a),false);F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,undefined);let native=0;assert.equal(L.run(s,a,()=>++native,null),1,'the original dedicated producer remains admitted');
});
test('native save payload never contains live pressure markers or private deadlines',()=>{
 const f=setup(),{r,s,a,F,api}=f;Object.assign(r,{Or:14,__HAPIL_RUN_V31400__:{serialize:()=>({version:1})},xe:()=>false});Object.assign(s,{clues:new Set(),completedZones:new Set(),spawnedWaves:new Set(),egoDrops:[],loopCycles:{}});a.ghostUntil=0;
 vm.runInContext(fn('Fi'),r);F.tick(s,api,.016);assert(s.hostileProjectiles.some(q=>q.rc231Pressure));const save=r.Fi(s,'hwando',[],{},0);assert.equal(save.version,13);assert(!('hostileProjectiles' in save));assert(!JSON.stringify(save).includes('rc231Pressure'));assert(!JSON.stringify(save).includes('pressureCursor'));
 const old=JSON.parse(JSON.stringify(save));old.savedAt=save.savedAt;for(const q of s.hostileProjectiles)delete q.rc231Pressure;const untagged=r.Fi(s,'hwando',[],{},0);untagged.savedAt=save.savedAt;assert.deepEqual(JSON.parse(JSON.stringify(untagged)),old);
});
test('rebased tagged live queues rebuild recovery privately while old saves start with native empty queues',()=>{
 const f=setup('DREAM'),{s,a,F,L,api}=f;F.tick(s,api,.016);const deadline=L.inspect(s,a,'pressure'),copy=JSON.parse(JSON.stringify(s));copy.time=0;copy.enemies=[JSON.parse(JSON.stringify(a))];for(const q of copy.hostileProjectiles)for(const key of ['born','frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[key]-=100;
 L.prepareFrame(copy);const next=L.inspect(copy,copy.enemies[0],'pressure');near(next.releaseAt,deadline.releaseAt-100);near(next.until,deadline.until-100);assert(!L.pressureReady(copy,copy.enemies[0]));copy.time=next.until;assert(L.pressureReady(copy,copy.enemies[0]));
 const old={...copy,time:0,enemies:[{...copy.enemies[0]}],hostileProjectiles:[]};assert(L.pressureReady(old,old.enemies[0]));assert.equal(L.inspect(old,old.enemies[0],'pressure'),null);assert.equal(old.enemies[0].recoverUntil,0);
 s.hp=0;L.prepareFrame(s);assert.equal(L.inspect(s,a,'pressure'),null);
});
test('death, stopped authority and transition drain cannot admit a pressure cast',()=>{
 for(const flag of ['paused','pause','enemySkillsSuppressedUntilV31309','timeStopUntil']){const f=setup(),{s,a,F,api}=f;s[flag]=flag.endsWith('Until')||flag==='enemySkillsSuppressedUntilV31309'?110:true;F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,undefined,flag);}
 const f=setup(),{s,a,F,api,r}=f;s.hp=0;F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,undefined);s.hp=240;r.__HAPIL_DANMAKU_RC129__={phase:()=>({index:0,name:'탄환',cycle:0,draining:true}),beforeTick(){}};F.tick(s,api,.016);assert.equal(a.rc95BulletCycle,undefined);
});
console.log('RC231_PRESSURE_CADENCE_UNIT '+JSON.stringify({status:'passed',checks,baseline:BASE,baselinePolicies:['assets/rc231/combat-lifecycle.js','assets/rc95/combat-flow.js'],comparison,scope:'Old/new lifecycle and flow policies with the same current native producer, density/fragment admission, warning preparation, movement and expiry dependencies. Full-HP CPU clock/placement/boundary-observer fixtures; actual native basic/ground admission and save serializer. Full baseline-tree/rendered visibility/live RAF/campaign checks are separate.'}));
