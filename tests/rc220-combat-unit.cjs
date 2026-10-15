'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const acorn=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/hapil-deps/node_modules','acorn'));
const w={console,setTimeout(){}};w.window=w;vm.createContext(w);
for(const file of ['assets/rc134/persona-duel.js','assets/rc210/projectile-balance.js','assets/rc220/combat.js','assets/rc220/slayer-motion.js','assets/rc210/deferred-damage.js'])vm.runInContext(fs.readFileSync(file,'utf8'),w);
const A=w.__HAPIL_COMBAT_RC220__,D=w.__HAPIL_BULLET_BALANCE_RC210__;
for(const kind of ['boss','midboss'])for(const child of [false,true])for(const sprite of ['branch.webp','./assets/rc64/projectiles/danmaku-jellybean.webp']){
 const a={id:'boss',hp:10,[kind]:true},s={zone:'dist00',time:10,hp:100,x:10,y:20,fxSerial:2,enemies:[a],hostileProjectiles:[]};
 const q={id:1,sourceId:child?'child':'boss',sourceBossId:'boss',x:20,y:10,vx:-1,vy:1,radius:1,hitRadius:.7,damage:12,sprite,born:10,life:5,bossCastId31210:3};s.hostileProjectiles=[q];D.prepare(s,a,q);const before=q.radius;
 A.prepareFrame(s);assert.equal(s.hostileProjectiles.length,2);assert.equal(q.radius,before*.5);assert.equal(s.hostileProjectiles[1].radius,q.radius);assert.notEqual(s.hostileProjectiles[1].id,q.id);assert.equal(s.hostileProjectiles[1].bossCastId31210,3);assert.equal(s.hostileProjectiles[1].life,5);assert.notEqual(s.hostileProjectiles[1].vx,q.vx);
 for(let i=0;i<200;i++)A.prepareFrame(s);assert.equal(s.hostileProjectiles.length,2);assert.equal(q.radius,before*.5);
 const copies=JSON.parse(JSON.stringify(s.hostileProjectiles));s.hostileProjectiles=copies;A.prepareFrame(s);assert.equal(s.hostileProjectiles.length,2,'serialized packets do not multiply again');
}
// Native arsenal and danmaku closures retain their original packet lists.
// Added lanes must follow delayed launch, time-stop shifts and cancellation.
for(const cancelled of [false,true]){const a={id:'boss',boss:true,hp:10},s={zone:'ep1a11',time:1,hp:10,x:14,y:24,fxSerial:2,enemies:[a],hostileProjectiles:[],pendingHits:[]},q={id:1,sourceId:a.id,x:24,y:14,vx:-2,vy:1,radius:.5,bodySpawned31219:false,motionReleaseAt31219:3,frozenUntil:3,coreContactsV31333:[]};s.hostileProjectiles=[q];A.prepareFrame(s);const copy=s.hostileProjectiles[1];q.motionReleaseAt31219=q.frozenUntil=5;A.prepareFrame(s);assert.equal(copy.frozenUntil,5);assert.equal(copy.bodySpawned31219,false);assert.notEqual(copy.coreContactsV31333,q.coreContactsV31333);if(cancelled){s.hostileProjectiles=[copy];A.prepareFrame(s);assert(copy.cancelled);}else{q.bodySpawned31219=true;q.x=23;q.vx=-1;q.vy=2;A.prepareFrame(s);assert(copy.bodySpawned31219);assert.equal(copy.x,23);assert(Math.abs(Math.atan2(copy.vy,copy.vx)-Math.atan2(q.vy,q.vx)-copy.rc220AngleOffset)<1e-8);s.hostileProjectiles=[copy];A.prepareFrame(s);assert(!copy.cancelled,'launched lanes live independently after original contact');}}
const s={zone:'ep1a11',x:14,y:24,hp:100,activeHeroId:'slayer',time:1,enemies:[{id:'dist00-boss',hp:100}],pendingHits:[],impactQueue:[]};
const field=A.field(s),h={rc220LuciferField:field};assert(field);assert(!A.fieldContact(A.world(field.safe.u,field.safe.v),h));assert(A.fieldContact({x:24,y:14},h));assert(!A.fieldContact({x:-100,y:-100},h));
let total=0,danger=0;const P=w.__HAPIL_PERSONA_DUEL_RC134__;for(let x=0;x<=32;x+=.25)for(let y=0;y<=32;y+=.25){if(!P.contains({x,y},'all',.8))continue;total++;if(A.fieldContact({x,y},h))danger++;}assert(danger/total>.8,'opening covers over 80% of the authored arena');
const dot={themeRootDotRC210:true,rootTargetRC220:'__host',themeZoneV31323:'ep1a11',damage:3};s.pendingHits=[dot];A.rootDots(s);assert.equal(dot.x,s.x);s.x+=5;s.y-=2;A.rootDots(s);assert.equal(dot.x,s.x);assert.equal(dot.y,s.y);assert(A.rootContact(s,dot));assert(!A.rootContact({heroId:'hwando'},dot));
const deferred=w.__HAPIL_DEFERRED_DAMAGE_RC210__;assert(deferred.periodic(dot));deferred.apply(s,s,3,dot);assert.equal(s.hp,97);assert.equal(deferred.pending(s),0,'DOT does not create more deferred damage');s.zone='dist01';A.rootDots(s);assert(dot.cancelled&&dot.damageSuppressedV31226);
for(const dir of ['front','back','left','right'])for(const t of [0,.1,.2,.5,.8,.99]){const p=w.__HAPIL_SLAYER_MOTION_RC220__.pose({hero:'slayer',kind:'attack',dir,sheet:'action',rigidProgress:t});assert.equal(p.frame,4+['front','back','left','right'].indexOf(dir));assert.equal(p.sheet,'action');}assert.equal(w.__HAPIL_SLAYER_MOTION_RC220__.pose({hero:'hwando'}),null);
const source=fs.readFileSync('assets/index-v31526.js','utf8');const at=source.indexOf('function Di('),node=acorn.parseExpressionAt(source,at,{ecmaVersion:'latest'});vm.runInContext(source.slice(node.start,node.end),w);assert(w.Di({x:24,y:14},h));assert(!w.Di(A.world(field.safe.u,field.safe.v),h));
// Run the actual arsenal closure with isolated dependencies, including its live cast ledger.
const begin=source.indexOf('(() => {',source.indexOf('/* HAPIL_V31318_ARSENAL_PATCH')),end=source.indexOf('\n})();',begin)+6;
let arsenal=source.slice(begin,end);arsenal=arsenal.replace('function schedule(){if(install()', 'window.__ARSENAL_TEST__={tryScheduleBaseRC127,impact,plan,tick};function schedule(){if(install()');
Object.assign(w,{G:(x,y)=>({x,y}),MONGSE_enemyActivePhase:()=>1,MONGSE_isEncounterLocked31226:()=>false,MONGSE_lockAtomicBossCast31210:()=>7});
vm.runInContext(arsenal,w);const native=w.__ARSENAL_TEST__,boss={id:'a11-cosmic-v31318',cosmicLuciferV31318:true,hp:100,maxHp:100,x:24,y:14};
const c={zone:'ep1a11',time:10,x:14,y:24,hp:100,maxHp:100,enemies:[boss],pendingHits:[],impactQueue:[],hostileProjectiles:[],effects:[],floatTexts:[],fxSerial:1};
const cast=native.tryScheduleBaseRC127(c,boss);assert.equal(cast.family,'cosmic-blood-beam');assert.equal(c.pendingHits.length,1);assert(c.pendingHits[0].rc220LuciferField);assert(A.opening(boss));
const packet=c.pendingHits[0];c.time=packet.at;let impacts=0;native.impact(c,packet,()=>impacts++,[]);assert.equal(impacts,1);assert(!A.opening(boss));assert.equal(boss.invulnerableUntil,c.time+1.05);assert(c.effects.some(e=>e.rc220LuciferField&&e.cosmicImpactV31318));
console.log('RC220_UNIT',JSON.stringify({status:'passed',densityIdempotent:true,attachedFiniteDots:true,nativeOpeningCast:true,arenaDangerFraction:danger/total}));
