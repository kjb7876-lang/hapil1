'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.equal(a,b,m);},plain=v=>JSON.parse(JSON.stringify(v));

function env(){
 const window={},context=vm.createContext({window,console,Set,Map,Math,Date,Object,Array,Number,String,JSON,Event,setTimeout:()=>0,clearTimeout:()=>{}});
 for(const file of ['assets/rc128/awakening-policy.js','assets/rc133/samong-policy.js','assets/rc91/samong-awakening.js','assets/rc134/persona-duel.js'])vm.runInContext(read(file),context,{filename:file});
 window.__HAPIL_PARTY_V31322__=null;
 window.__HAPIL_RC86_BRIDGE__={actor:(zone,id)=>({id,zone,name:'교주',hp:0,maxHp:1500,sprite:'./assets/cult-v3123/pride_cyborg_cult_leader.webp'}),cloneEnemy:a=>({...a}),point:()=>({x:23,y:10})};
 window.__HAPIL_CONTROLS_V31329__={binding:{passives:{current:{}}}};
 vm.runInContext(read('assets/rc133/inner-final.js'),context,{filename:'assets/rc133/inner-final.js'});
 const Final=window.__HAPIL_INNER_FINAL_RC133__,Samong=window.__HAPIL_SAMONG_RC91__,shots=[],casts=[];

 const skillMap=Object.fromEntries(Final.deck.map(k=>[k.key,'./assets/rc134/persona-skills/'+k.key+'.png'])),samongSkillMap=Object.fromEntries(Final.deck.map(k=>[k.key,'./assets/rc133/art/'+k.key+'.png']));Final.configure({ready:true,map:'map',body:'body',awakening:'awake',skills:[...Object.values(skillMap),...Object.values(samongSkillMap)],skillMap,samongSkillMap});
 let serial=1;Final.bind({heroes:Samong.heroes.map(id=>({id,sprite:'hero-'+id})),locked:()=>false,bullet:(s,a,spec)=>{const q={id:serial++,sourceId:a.id,x:a.x,y:a.y,previousX:a.x,previousY:a.y,...spec};s.hostileProjectiles.push(q);shots.push(q);return q;},cast:(s,a,spec)=>{const q={...spec,id:serial++,sourceId:a.id,born:s.time,at:s.time+spec.windup,x:spec.anchor==='boss'?a.x:s.x,y:spec.anchor==='boss'?a.y:s.y,originX:a.x,originY:a.y};s.pendingHits.push(q);casts.push(q);return q;}});
 const state=(hero='gunner')=>({zone:'cult04',gameModeV31346:'DREAM',samongUnlockedRC91:true,hp:220,maxHp:1000,time:10,x:7,y:9,activeHeroId:hero,enemies:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],effects:[],floatTexts:[],fxSerial:1,bossDefeated:false,completedZones:new Set(),spawnedWaves:new Set()});
 return{window,context,Final,Samong,shots,casts,state};
}

// Every awakened identity now launches a unique, finite pattern through the
// native projectile constructor. The shot has a visible windup before contact.
{
 const {Final,shots,state}=env(),s=state();s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});
 ok(Final.beforeDeath(s,s.enemies[0]),'Dream cult death enters hidden finale');
 const m=s.innerFinalRC133;eq(Final.snapshot(s).playerFatalAt,-1,'fresh hidden boss has no false near-lethal marker');m.intro=0;m.awakeningCooldown=10;
 const signatures=new Set();
 for(const id of ['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']){
  const a=Final.boss(s);m.hero=id;m.cycle=0;s.activeHeroId=id;m.shotDelay=0;s.hostileProjectiles=[];s.time+=1;
  const first=shots.length;Final.tick(s,.016);const wave=shots.slice(first);
  eq(wave.length,Math.min(12,Math.ceil(Final.deck[0].count*1.5)),id+' emits its bounded denser authored pattern');
  ok(wave.every(q=>q.rc133InnerShot&&q.rc133Skill===Final.deck[0].key&&q.rc133Pattern===Final.deck[0].key&&q.damage>0&&q.radius<=.32),id+' shots keep ownership/damage/radius');
  ok(wave.every(q=>q.frozenUntil>=s.time+.65&&q.collisionDisabledUntil31219>=q.frozenUntil),id+' telegraph delays collision');
  const directions=wave.map(q=>Math.atan2(q.vy,q.vx).toFixed(3)).sort().join(',');signatures.add(directions);
 }
 eq(signatures.size,1,'dedicated skill geometry is independent of borrowed hero traits');
 // The hostile queue cap delays a wave without losing its retry opportunity.
 m.hero='gunner';m.cycle=0;s.activeHeroId='gunner';m.shotDelay=0;s.hostileProjectiles=Array.from({length:70},(_,i)=>({id:'held-'+i}));const old=shots.length;Final.tick(s,.016);eq(shots.length,old,'full queue refuses overflow shots');
 s.hostileProjectiles=[];m.shotDelay=0;Final.tick(s,.016);eq(shots.length-old,8,'a freed queue promptly admits the pending skill');
}

// A lethal player hit close to the hidden boss's defeat becomes one saved,
// low-health paired awakening. It cannot refill a second life in that fight.
{
 const {Final,Samong,window,state}=env(),s=state('neon');s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});
 Final.beforeDeath(s,s.enemies[0]);const m=s.innerFinalRC133;m.intro=0;const a=Final.boss(s);a.hp=Math.ceil(a.maxHp*.1);s.hp=0;
 eq(Samong.tryRevive(s),false,'near-final player death waits for explicit choice');eq(s.hp,0,'pending choice never restores HP');ok(Samong.chooseRevival(s,'samong'),'explicit player choice starts the paired awakening');
 eq(Math.round(s.hp/s.maxHp*100),22,'player returns at a bounded low health');eq(Math.round(a.hp/a.maxHp*100),10,'living hidden boss keeps its damaged health');
 eq(Samong.active(s),true,'player receives the seven-second Samong awakening');eq(m.awake,7,'boss receives its opposing awakening');eq(Final.mood(s),'opposition','the arena enters the half-white/half-red duel');
 eq(s.samongPassiveRC91.encounterRC128.used,true,'the normal encounter revival token is consumed');
 const snap=Final.snapshot(s),passive=Samong.snapshot(s),restored=state('neon');restored.time=s.time;Final.restore(restored,snap);Samong.restore(restored,passive);
 const ra=Final.boss(restored);ok(restored.innerFinalRC133.clash.used&&!!ra,'native save restore retains one-use duel and both combatants');
 eq(Math.round(restored.hp/restored.maxHp*100),22,'native restore preserves duel player health');eq(Math.round(ra.hp/ra.maxHp*100),10,'native restore preserves living boss progress');
 restored.samongPassiveRC91.active=0;restored.samongPassiveRC91.cooldown=0;restored.hp=0;eq(Samong.tryRevive(restored),false,'duel token cannot grant a second lethal revival');
 ra.hp=0;eq(Final.beforeDeath(restored,ra),false,'a second boss defeat completes the hidden fight instead of replaying the clash');eq(restored.innerFinalRC133.phase,'complete','hidden finale completes after the actual final defeat');
 const modes=env();const story=state();story.gameModeV31346='STORY';story.enemies=[{id:'c104-boss',hp:0,maxHp:1500}];eq(modes.Final.beforeDeath(story,story.enemies[0]),false,'Story cult death is unchanged');
}

// The very first lethal contact must trigger at full boss HP. An existing
// EGO awakening is reused; one pending seventh entry is consumed atomically.
{
 const {Final,Samong,window,state}=env(),s=state('hunter');s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});Final.beforeDeath(s,s.enemies[0]);const m=s.innerFinalRC133;m.intro=0;const a=Final.boss(s),bossHp=a.hp;
 const policy=window.__HAPIL_SAMONG_POLICY_RC133__;
 Object.assign(policy.memory(s),{count:7,pending:true});ok(Samong.tryEgo(s),'pre-existing EGO awakening fixture admitted');
 const activations=s.samongPassiveRC91.activations;Object.assign(policy.memory(s),{count:7,pending:true});s.hp=0;
 eq(Samong.tryRevive(s),false,'first lethal awaits the real choice');ok(Samong.chooseRevival(s,'samong'),'actual choice admits duel at full boss health');eq(a.hp,bossHp,'intentional lethal damage cannot reduce a healthy boss');
 eq(s.samongPassiveRC91.activations,activations+1,'distinct chosen revival refreshes awakening once');eq(policy.status(s).count,7,'revival preserves independent pending EGO7');eq(policy.status(s).pending,true,'EGO remains queued for its own admission');eq(policy.status(s).serial,1,'revival cannot repeat EGO admission');
 const finalSave=Final.snapshot(s),passiveSave=Samong.snapshot(s);eq(finalSave.clash.admitted,true,'admitted duel marker saved');
 s.hp=0;eq(Samong.activateFinalClash(s),false,'direct replay cannot bypass the used special token');
 const restored=state('hunter');restored.time=s.time;restored.hp=220;Final.restore(restored,finalSave);Samong.restore(restored,passiveSave);eq(Final.boss(restored).hp,bossHp,'restored duel preserves actual living boss progress');
 eq(Final.mood(restored),'opposition','restored paired arena is active');eq(policy.status(restored).pending,true,'restore retains independent pending EGO');
 restored.hp=0;eq(Samong.tryRevive(restored),false,'restore cannot grant another life');
}

// Boss-first lethal damage has the same one-use paired admission for every
// hero. The living player's health and healing ceiling are never rewritten.
{
 for(const hero of ['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']){
  const {Final,Samong,window,state}=env(),s=state(hero);s.enemies=[{id:'c104-boss',hp:0,maxHp:1500}];Final.start(s,s.enemies[0]);const a=Final.boss(s);s.hp=740;s.heroHealingCeiling=810;a.hp=0;
  Object.assign(window.__HAPIL_SAMONG_POLICY_RC133__.memory(s),{count:7,pending:true});
  ok(Final.beforeDeath(s,a),hero+' first boss lethal is intercepted before native removal');eq(a.hp,Math.ceil(a.maxHp*.22),hero+' dead boss revives once at 22%');eq(s.hp,740,hero+' living player health preserved');eq(s.heroHealingCeiling,810,hero+' living healing ceiling preserved');
  eq(s.innerFinalRC133.clash.reason,'boss',hero+' saves genuine boss-first cause');eq(Final.mood(s),'opposition',hero+' counter awakening produces split arena');eq(window.__HAPIL_SAMONG_POLICY_RC133__.status(s).pending,true,hero+' boss counter preserves pending EGO');
  const restored=state(hero);restored.hp=s.hp;restored.heroHealingCeiling=s.heroHealingCeiling;restored.time=s.time;Final.restore(restored,Final.snapshot(s));Samong.restore(restored,Samong.snapshot(s));
  eq(restored.hp,740,hero+' boss-first restore retains living player HP');eq(restored.innerFinalRC133.clash.reason,'boss',hero+' boss-first cause survives restore');
  restored.hp=0;restored.samongPassiveRC91.active=0;restored.samongPassiveRC91.cooldown=0;eq(Samong.tryRevive(restored),false,hero+' first player lethal awaits choice');ok(Samong.chooseRevival(restored,'samong'),hero+' real choice retains its separate revival');
  const dead=Final.boss(restored);dead.hp=0;eq(Final.beforeDeath(restored,dead),false,hero+' second boss lethal is terminal');eq(restored.innerFinalRC133.phase,'complete',hero+' terminal second lethal saves completion');
 }
}

// Every supplied skill enters the actual constructor/cast adapter. No skill
// is claimed merely because it is preloaded or used as decorative feedback.
{
 const {Final,state,shots,casts}=env(),s=state();s.enemies=[{id:'c104-boss',hp:0,maxHp:180000}];Final.start(s,s.enemies[0]);const m=s.innerFinalRC133;m.intro=0;
 ok(m.maxHp>=180000*1.65,'hidden boss is tougher than the defeated cult leader');eq(m.healthModel,2,'new bounded model is saved');
 const keys=new Set();for(let i=0;i<9;i++){s.time++;s.hostileProjectiles=[];s.pendingHits=[];m.shotDelay=0;Final.tick(s,.016);const packets=[...s.hostileProjectiles,...s.pendingHits];ok(packets.length>0,'skill '+Final.deck[i].key+' actually dispatched');packets.forEach(q=>keys.add(q.rc133Skill));ok(packets.every(q=>q.damage>0&&q.damage<=20&&q.sourceId===Final.id),'bounded real packets for '+Final.deck[i].key);}
 eq(keys.size,9,'all nine supplied skills used in one persisted cycle');ok(shots.length>0&&casts.length===0,'RC134 replaces teleporting area hits with cross-center native projectiles');
 eq(Final.health(s,{maxHp:1e100},{infinitePower:1e100}),3000000,'unbounded growth cannot exceed HP ceiling');
 const restored=state();Final.restore(restored,Final.snapshot(s));eq(restored.innerFinalRC133.cycle,9,'deck position survives native restore');eq(Final.boss(restored).maxHp,m.maxHp,'reload cannot recalibrate health');
}

// Synchronous feedback/save observers see both sides awakened. Reentrant
// lethal admission cannot see or replay a partially published transaction.
{
 const {Final,Samong,window,state}=env(),s=state();s.enemies=[{id:'c104-boss',hp:0,maxHp:1500}];Final.start(s,s.enemies[0]);const a=Final.boss(s);a.hp=0;s.hp=0;Object.assign(window.__HAPIL_SAMONG_POLICY_RC133__.memory(s),{count:7,pending:true});let observed=null;
 window.__HAPIL_COMBAT_CORE_V31401__={step:()=>{observed={inner:Final.snapshot(s),player:Samong.snapshot(s),hp:s.hp};eq(Samong.activateFinalClash(s),false,'reentrant observer cannot replay admission');}};
 eq(Samong.tryRevive(s),false,'simultaneous player lethal waits for choice');ok(Samong.chooseRevival(s,'samong'),'simultaneous real choice admits duel');eq(observed.inner.awake,7,'save observer sees boss awakening already published');eq(observed.inner.hp,a.hp,'save observer sees revived boss health');eq(observed.hp,220,'save observer sees player revival');eq(observed.player.egoRC133.pending,true,'observer sees independent EGO7 preserved');eq(observed.inner.clash.admitted,true,'observer sees committed duel admission');
 const denied=state();denied.enemies=[{id:'c104-boss',hp:0,maxHp:1500}];Final.start(denied,denied.enemies[0]);denied.hp=0;const d=Final.boss(denied),before=Final.snapshot(denied);window.__HAPIL_SAMONG_POLICY_RC133__.memory(denied).admitting=true;eq(Final.startClash(denied,d),false,'concurrent EGO admission refuses special transaction');eq(JSON.stringify(Final.snapshot(denied)),JSON.stringify(before),'failed admission rolls back all hidden actor state');
}

// Bitmap geometry uses measured opaque pixels (not transparent canvas gutters)
// while retaining the native physical radius if an image is unreadable.
{
 const window={__HAPIL_COMBAT_V31333__:{frozen:()=>false,core:a=>({x:a.x,y:a.y}),piercing:()=>false,seen:()=>false}};
 window.__HAPIL_COVERAGE_V31318__={alphaBounds:image=>image.alpha};
 const context=vm.createContext({window,Number,Math,Map,Set,Object,Array,String,WeakMap,Infinity});
 vm.runInContext(read('assets/combat-v31402/contact-geometry.js'),context,{filename:'contact-geometry.js'});
 const api=window.__HAPIL_GEOMETRY_V31402__.create({project:(x,y)=>({x,y}),heroes:()=>[{id:'hwando'}],combat:window.__HAPIL_COMBAT_V31333__});
 const s={x:0,y:0,hp:100,activeHeroId:'hwando',time:1},q={x:27,y:0,previousX:27,previousY:0,visualYV31333:0,vx:0,vy:0,radius:.1,boss:true,visualScaleV31224:1,sprite:'small.png'};
 const small={complete:true,naturalWidth:100,naturalHeight:100,alpha:{x:40,y:40,width:20,height:20,cx:50,cy:50,measured:true}};
 ok(api.recordProjectileBitmap(q,small,100,100,0),'opaque bitmap bounds are admitted');eq(api.projectile(s,s,q).hit,false,'transparent gutters do not enlarge a small projectile hitbox');
 q.x=26;q.previousX=26;eq(api.projectile(s,s,q).hit,true,'active projectile pixels contact the native hero body');
 const large={complete:true,naturalWidth:100,naturalHeight:100,alpha:{x:5,y:5,width:90,height:90,cx:50,cy:50,measured:true}},wide={...q,x:60,previousX:60};
 ok(api.recordProjectileBitmap(wide,large,100,100,0),'large active bitmap is admitted');eq(api.projectile(s,s,wide).hit,true,'large active bitmap uses its rendered footprint');
 const ignored={complete:true,naturalWidth:100,naturalHeight:100,alpha:{x:0,y:0,width:100,height:100,cx:50,cy:50,measured:false}};eq(api.recordProjectileBitmap({...q},ignored,100,100),false,'unmeasured images keep the conservative native fallback');
}

console.log(JSON.stringify({status:'passed',checks}));
