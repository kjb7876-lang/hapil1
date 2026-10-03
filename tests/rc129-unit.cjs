'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const check=(ok,msg)=>{checks++;assert.ok(ok,msg);};
const window={innerWidth:1180,console,setTimeout(){},matchMedia:()=>({matches:false})};
const context=vm.createContext({window,console,setTimeout(){},performance:{now:()=>0},Date,Math});
for(const file of ['assets/combat-v31402/combat-core.js','assets/rc127/combat-policy.js','assets/rc128/combat-feedback.js','assets/combat-v31412/skill-completion.js','assets/rc97/choice-patterns.js','assets/rc95/combat-flow.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const D=window.__HAPIL_DANMAKU_RC129__,C=window.__HAPIL_COMBAT_CORE_V31401__,P=window.__HAPIL_POLICY_RC127__,locked={locked:()=>false};
const fresh=(mode='STORY')=>({zone:'test01',time:1,hp:240,maxHp:240,x:16,y:16,activeHeroId:'hwando',gameModeV31346:mode,resonance:0,enemies:[{id:'b03-boss',name:'질투의 거울',boss:true,hp:1000,maxHp:1000,x:8,y:8}],hostileProjectiles:[],pendingHits:[],effects:[]});
function tick(s,seconds){for(let t=0;t<seconds-1e-8;){const dt=Math.min(.1,seconds-t);s.time+=dt;D.beforeTick(s,locked,dt);t+=dt;}}
let s=fresh();D.beforeTick(s,locked,.1);check(D.phase(s).remaining===12,'STORY twelve-second phase');
let d=fresh('DREAM');D.beforeTick(d,locked,.1);check(D.phase(d).remaining===10,'DREAM ten-second phase');
check(D.mode(fresh('HELL'))==='STORY','no new HELL director');
const before=D.phase(s).remaining;s.paused=true;tick(s,2);check(D.phase(s).remaining===before,'pause cannot consume spell timer');s.paused=false;
s.timeStopUntil=s.time+2;tick(s,1);check(D.phase(s).remaining===before,'enemy time stop does not consume phase');s.timeStopUntil=0;
s.pendingHits=[{id:'committed',sourceId:'b03-boss',at:s.time+15,damage:20}];
s.hostileProjectiles=[{id:'old',sourceId:'b03-boss',vx:1,vy:0,damage:10},{id:'ally',sourceId:'b03-boss',friendly:true},{id:'reflect',sourceId:'b03-boss',reflected:true},{id:'field',sourceId:'b03-boss',persistentRC129:true},{id:'other',sourceId:'other-boss'}];
const deadline=s.pendingHits[0].at;tick(s,12.2);check(D.phase(s).stage==='draining','expired phase drains outstanding cast');check(!D.admission(s,s.enemies[0]),'no new cast during drain');check(s.pendingHits[0].at===deadline,'native impact time unchanged');check(s.hostileProjectiles.length===5,'no early cancellation');
s.time=deadline+.01;D.beforeTick(s,locked,.01);check(D.phase(s).stage==='rest','completed cast opens transition rest');check(s.pendingHits.length===0,'spent owned pending hit cleans');check(s.hostileProjectiles.length===4,'only hostile ordinary owned bullet removed');check(s.hostileProjectiles.every(q=>q.id!=='old'),'old hostile shot gone');tick(s,.8);check(D.phase(s).index===1&&D.phase(s).stage==='active','next named laser phase starts after rest');
check(s.hp===240&&s.enemies[0].hp===1000,'no HP/forced victory side effects');
const snapshot=JSON.stringify(D.snapshot(s));for(let i=0;i<50;i++)D.phase(s);check(JSON.stringify(D.snapshot(s))===snapshot,'phase reads are simulation read-only');
s.enemies[0].hp=600;D.beforeTick(s,locked,.1);check(D.phase(s).stage==='rest','HP band boundary triggers completion-safe transition');
const saved=D.exportSave(s),restored=fresh();restored.enemies[0].hp=600;D.restore(restored,JSON.parse(JSON.stringify(saved)));D.beforeTick(restored,locked,.1);check(D.phase(restored).serial===saved.phase.serial,'save preserves phase sequence');
for(const bad of [null,{}, {version:3,zone:'test01'}, {version:1,zone:'x'.repeat(80)}])check(D.cleanSave(bad)===null,'reject malformed save');
// Geometry properties are mathematical fixtures, not a whole-level pathfinding claim.
let corridors=0,minClearance=Infinity;
for(const mode of ['STORY','DREAM'])for(const name of ['집착','맘몬 탐욕','사탄 분노','질투 거울','명령 통제','무명'])for(const angle of [0,.4,1.2,2.3,3.8,5.1])for(const distance of [2.5,4,8,15]){
 const w=fresh(mode),a=w.enemies[0];a.id='fixture-'+name;a.name=name;a.x=16;a.y=16;w.x=16+Math.cos(angle)*distance;w.y=16+Math.sin(angle)*distance;
 D.beforeTick(w,locked,.1);for(const beat of [0,1]){a.rc95BulletCycle=beat;const phase=D.phase(w),shots=D.volley(w,a,phase,7);check(shots.length===(mode==='STORY'?6:7),'mode-specific spoke count');
  for(const q of shots){check([q.x,q.y,q.vx,q.vy,q.radius,q.rc129Plan.halfGap].every(Number.isFinite),'finite projectile plan');check(q.homingMode31212==='none','not live homing');
   for(const headingShift of [-.15,0,.15]){const heading=Math.atan2(q.vy,q.vx)+headingShift,px=w.x-a.x,py=w.y-a.y,forward=px*Math.cos(heading)+py*Math.sin(heading),clear=forward<0?distance:Math.abs(px*Math.sin(heading)-py*Math.cos(heading));minClearance=Math.min(minClearance,clear);check(clear>=q.rc129Plan.clearance-1e-8,'corridor survives bounded legacy zigzag');corridors++;}
  }
 }
}
// Native accepted graze transactions are the ONLY bonus source.
s=fresh();D.beforeTick(s,locked,.1);for(let i=0;i<5;i++){tick(s,.15);const q={id:'graze-'+i,sourceId:'b03-boss',born:0,damage:10,vx:1,vy:0,x:16,y:16};check(C.graze(s,q,()=>true),'native graze accepted');}
check(s.resonance===2,'five unique grazes award exactly two bonus resonance');check(D.snapshot(s).graze.guard===4,'short guard reward begins');check(Math.abs(P.incoming(s,{sourceId:'b03-boss'})-.95)<1e-8,'5 percent damage mitigation integrated');
const ledger=C.snapshot(s);check(ledger.events.some(r=>r.resonanceAwarded===2),'bonus belongs to the authoritative resource journal');
for(let i=0;i<100;i++)C.graze(s,{id:'graze-4',sourceId:'b03-boss',born:0,damage:10},()=>true);check(s.resonance===2,'same projectile cannot farm bonus');
const copy=fresh();D.restore(copy,D.exportSave(s));D.beforeTick(copy,locked,.1);check(!D.graze(copy,{id:'graze-4',sourceId:'b03-boss',born:0,damage:10}),'save/load retains rewarded IDs');
for(let i=5;i<80;i++){tick(s,.11);C.graze(s,{id:'graze-'+i,sourceId:'b03-boss',born:0,damage:10,vx:1,vy:0},()=>true);}check(D.snapshot(s).graze.budget<=10&&s.resonance<=10,'bounded bonus per ten-second window');
D.contact(s,s,{result:'HIT',hpLoss:1});check(D.snapshot(s).graze.combo===0,'actual damage breaks streak');
s.rc127Defense={incoming:.25};check(P.incoming(s,{sourceId:'b03-boss'})===.25,'existing max damage-reduction cap preserved');check(P.incoming(s,{selfDamage:true})===1,'self damage is not reduced by graze');
const factor=P.incoming(s,{sourceId:'b03-boss'});tick(s,5);check(D.snapshot(s).graze.guard===0,'graze guard expires');
check(window.__HAPIL_DANMAKU_HUD_RC129__.snapshot().metrics.errors===0,'no optional hook errors');
console.log('RC129_UNIT_RESULT',JSON.stringify({status:'passed',checks,corridorSamples:corridors,minClearance,scope:'VM policies and geometric fixtures; not native campaign traversal',stats:D.snapshot(s).stats}));
