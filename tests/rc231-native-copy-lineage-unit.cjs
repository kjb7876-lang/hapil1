'use strict';
// The existing RC220 final-packet producer adds one native density child after
// ordinary admission. Its child inherits flags but has its own ID/contact sets.
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8'),base='346bee26788b789168fca50f63f12a09f6869c2d',file='assets/rc220/combat.js',source=read(file),original=cp.execFileSync('git',['show',base+':'+file],{encoding:'utf8'});
assert.equal(source,original,'the complete native RC220 producer is unchanged from baseline');
const hash=crypto.createHash('sha256').update(source).digest('hex'),rows=[];
for(const mobile of [false,true]){
 const w={window:null,innerWidth:mobile?844:1280};w.window=w;w.__HAPIL_COMBAT_RC47__={mobile:()=>mobile};vm.createContext(w);vm.runInContext(read('assets/rc210/projectile-balance.js'),w);vm.runInContext(source,w);vm.runInContext(read('assets/combat-v31402/projectile-pipeline.js'),w);
 const D=w.__HAPIL_BULLET_BALANCE_RC210__,K=w.__HAPIL_COMBAT_RC220__,V=w.__HAPIL_PROJECTILE_PIPELINE_V31402__,cap=D.admissionCap(),a={id:'mb-dist01',midboss:true,hp:100,x:24,y:14},s={zone:'dist01',time:100,hp:240,x:13.8,y:24.2,fxSerial:1,enemies:[a],hostileProjectiles:[],pendingHits:[],impactQueue:[]};
 const seen=new Set(),events=[],cycles=[],lineage=new Map();w.contacts=vm.runInContext('()=>new Set(["hero"])',w);w.H=()=>({id:'inner-evil-rc133'});w.provenance={allow:()=>true,finalizeAdded:(s,start,a,p,apply)=>s.hostileProjectiles.slice(start).forEach(apply)};
 w.MONGSE_pushThemeProjectile3129=(s,a,p)=>{s.hostileProjectiles.push({...p,id:s.fxSerial++,sourceId:a.id,x:a.x,y:a.y,originX:a.x,originY:a.y,born:s.time,expiresAt:s.time+9,bodySpawned31219:true,hitTargets:w.contacts(),hitActors:['p1']});};
 const integration=read('assets/rc133/native-install-v2.js.txt'),at=integration.indexOf('  const personaBullet='),end=integration.indexOf('\n  const personaCast=',at);assert(at>0&&end>at);vm.runInContext(integration.slice(at,end),w);
 function emitCycle(cycle){
  const start=s.hostileProjectiles.length;assert(start+10<=cap);assert(start+10<=D.policy.extraOwnerCap);
  for(let i=0;i<5;i++){
   const prior=[...s.hostileProjectiles],allowed=D.canEmit(s,a,{vx:-3,vy:2}),packet={vx:-3,vy:2,radius:.28,damage:10,patternKind:'rc95-volley',rc95Bullet:true,rc231Pressure:true,rc126Salvo:'native-cycle-'+cycle,motionReleaseAt31219:s.time+.5,frozenUntil:s.time+.5,telegraphUntil31210:s.time+.5,collisionDisabledUntil31219:s.time+.5,collisionDisabledUntilV31226:s.time+.5};
   w.MONGSE_pushThemeProjectile3129(s,a,packet);const added=s.hostileProjectiles.filter(q=>!prior.includes(q));assert(allowed&&prior.length<cap&&s.hostileProjectiles.length<=cap);assert.equal(added.length,2);events.push(...added.map(q=>q.id));
  }
  const native=s.hostileProjectiles.slice(start);assert.equal(native.length,10);assert.equal(native.filter(q=>q.rc210DensityExtra).length,5);cycles.push({cycle,direct:native.map(q=>q.id)});
  // This reproduces the old observer's blind spot: children produced in the
  // following native frame get mistaken for the next newly announced salvo.
  const wronglyGrouped=s.hostileProjectiles.filter(q=>q.rc95Bullet&&!seen.has(q));for(const q of wronglyGrouped)seen.add(q);
  K.prepareFrame(s);const children=s.hostileProjectiles.filter(q=>q.rc220DensityCopy&&native.some(p=>p.id===q.rc220ParentId));assert.equal(children.length,10);
  for(const q of children){const p=native.find(p=>p.id===q.rc220ParentId);assert(p&&!p.rc220DensityCopy&&p.rc220DensityProcessed);assert.equal(q.sourceId,p.sourceId);assert.equal(q.rc95Bullet,p.rc95Bullet);assert.equal(q.rc210DensityExtra,p.rc210DensityExtra);assert.equal(q.rc126Salvo,p.rc126Salvo);assert.equal(q.rc231Pressure,p.rc231Pressure);assert.notEqual(q.id,p.id);assert.notEqual(q.hitTargets,p.hitTargets);assert.notEqual(q.hitActors,p.hitActors);assert.deepEqual([...q.hitTargets],[...p.hitTargets]);assert.deepEqual([...q.hitActors],[...p.hitActors]);
   for(const key of ['damage','radius','born','expiresAt','frozenUntil','motionReleaseAt31219','telegraphUntil31210','collisionDisabledUntil31219','collisionDisabledUntilV31226'])assert.equal(q[key],p[key],key+' remains tied to the actual native parent');
   assert(Math.abs(Math.hypot(q.vx,q.vy)-Math.hypot(p.vx,p.vy))<1e-9);assert(Math.abs(Math.abs(Math.atan2(Math.sin(Math.atan2(q.vy,q.vx)-Math.atan2(p.vy,p.vx)),Math.cos(Math.atan2(q.vy,q.vx)-Math.atan2(p.vy,p.vx))))-.085)<1e-9);assert.equal(V.contactEnabled(q,p.motionReleaseAt31219-.001),false);assert.equal(V.contactEnabled(q,p.motionReleaseAt31219),true);
   lineage.set(q.id,p.id);
  }
  const count=s.hostileProjectiles.length;for(let i=0;i<20;i++)K.prepareFrame(s);assert.equal(s.hostileProjectiles.length,count,'native density processing is once per original, never recursive');
  return{cycle,direct:native.length,nativeChildren:children.length,oldObserverMisgrouped:wronglyGrouped.length,afterNativePreparation:count};
 }
 const first=emitCycle(1);s.time+=2;const second=emitCycle(2);
 // Controlled terminal-retirement fixture opens the third whole native salvo;
 // no live production packet is clipped to manufacture a global queue cap.
 const required=Math.max(2,s.hostileProjectiles.length+10-cap);s.hostileProjectiles=s.hostileProjectiles.slice(required);s.time+=2;const third=emitCycle(3);
 assert.equal(events.length,30);assert(s.hostileProjectiles.length>cap);assert(s.hostileProjectiles.every(q=>q.rc95Bullet));assert.equal(s.hostileProjectiles.filter(q=>q.echoBoltV31368).length,0);
 const direct=new Set(events),tracked=new Set(s.hostileProjectiles.map(q=>q.id));assert([...tracked].every(id=>direct.has(id)||lineage.has(id)&&direct.has(lineage.get(id))));assert([...lineage].every(([id,parent])=>id!==parent&&direct.has(parent)&&!lineage.has(parent)));
 rows.push({mobile,ordinaryAdmissionCap:cap,cycles:[first,second,third],actualGuardedIDs:events.length,nativeChildBirths:lineage.size,rawQueueAfterNativeCopies:s.hostileProjectiles.length,sourceOwnedLineageExact:true});
}
// The same native postprocessor also copies original echo bolts. Their source
// limit governs fire admission, before the later once-per-parent copy pass.
const bundle=read('assets/index-v31526.js'),priorBundle=cp.execFileSync('git',['show',base+':assets/index-v31526.js'],{encoding:'utf8',maxBuffer:64*1024*1024});
function echoParts(text){const at=text.indexOf('/* 3.13.68: bounded, owner-authored echoes.'),begin=text.indexOf(' const cfg=',at),cfgEnd=text.indexOf(';',begin)+1,ownerStart=text.indexOf(' function owner(',at),ownerEnd=text.indexOf('\n function colors(',ownerStart),fireStart=text.indexOf(' function fire(',at),fireEnd=text.indexOf('\n function spawn(',fireStart);assert(at>0&&begin>at&&cfgEnd>begin&&ownerStart>at&&ownerEnd>ownerStart&&fireStart>at&&fireEnd>fireStart);return text.slice(begin,cfgEnd)+text.slice(ownerStart,ownerEnd)+text.slice(fireStart,fireEnd);}
const echoSource=echoParts(bundle);assert.equal(echoSource,echoParts(priorBundle),'actual echo fire, owner and limits remain byte-identical to the baseline');
const echoWorld={window:null},echoMemory={serial:0};echoWorld.window=echoWorld;vm.createContext(echoWorld);vm.runInContext(read('assets/rc210/projectile-balance.js'),echoWorld);vm.runInContext(source,echoWorld);echoWorld.C=()=>null;echoWorld.mem=()=>echoMemory;echoWorld.stats={bolts:0,volleys:0};vm.runInContext(echoSource,echoWorld);
const echoOwner={id:'b03-boss',boss:true,hp:100,x:24,y:14},echoState={hp:240,zone:'ep1b03',time:100,x:14,y:24,fxSerial:1,enemies:[echoOwner],hostileProjectiles:[]},cue={kind:'bolt',ownerId:echoOwner.id,x:24,y:14,tx:14,ty:24,path:'./native-echo-fixture.webp'},echoAdmissions=[];
for(let i=0;i<3;i++){const before=echoState.hostileProjectiles.length;assert.equal(echoWorld.fire(echoState,cue),true);const after=echoState.hostileProjectiles.length;assert(before<12&&after<=12);echoAdmissions.push({before,after});}
echoWorld.__HAPIL_COMBAT_RC220__.prepareFrame(echoState);const echoChildren=echoState.hostileProjectiles.filter(q=>q.rc220DensityCopy),echoRaw=echoState.hostileProjectiles.length;assert.equal(echoRaw,18);assert.equal(echoChildren.length,9);assert(echoChildren.every(q=>q.echoBoltV31368&&echoState.hostileProjectiles.some(p=>p.id===q.rc220ParentId&&!p.rc220DensityCopy&&p.echoBoltV31368)));
echoWorld.fire(echoState,cue);assert.equal(echoState.hostileProjectiles.length,echoRaw,'native echo admission counts existing copies and rejects another origin volley');echoWorld.__HAPIL_COMBAT_RC220__.prepareFrame(echoState);assert.equal(echoState.hostileProjectiles.length,echoRaw,'echo children also remain a single native generation');
console.log('RC231_NATIVE_COPY_LINEAGE_UNIT '+JSON.stringify({status:'passed',scenarios:rows.length,nativeChildren:rows.reduce((n,r)=>n+r.nativeChildBirths,0),baseline:base,source:file,sourceSha256:hash,sourceUnchanged:true,rows,echoDomain:{sourceUnchanged:true,nativeFireAdmissions:echoAdmissions,originAdmissionLimit:12,origins:9,nativeChildren:echoChildren.length,rawAfterCopies:echoRaw,laterFireAdded:0},scope:'Actual unchanged RC220 prepareFrame/copy producer plus actual final guarded emitter and native echo fire. CPU queue, clock and explicit retirement fixtures. Each native child is proved by its real producer/parent, not by inherited flags or a fabricated direct-admission receipt; Chrome birth receipts remain separate.'}));
