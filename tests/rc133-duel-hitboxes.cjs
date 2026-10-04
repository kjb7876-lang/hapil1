'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.equal(a,b,m);},plain=v=>JSON.parse(JSON.stringify(v));

function env(){
 const window={},context=vm.createContext({window,console,Set,Map,Math,Date,Object,Array,Number,String,JSON,Event,setTimeout:()=>0,clearTimeout:()=>{}});
 for(const file of ['assets/rc128/awakening-policy.js','assets/rc133/samong-policy.js','assets/rc91/samong-awakening.js'])vm.runInContext(read(file),context,{filename:file});
 window.__HAPIL_PARTY_V31322__=null;
 window.__HAPIL_RC86_BRIDGE__={actor:(zone,id)=>({id,zone,name:'교주',hp:0,maxHp:1500,sprite:'./assets/cult-v3123/pride_cyborg_cult_leader.webp'}),cloneEnemy:a=>({...a}),point:()=>({x:23,y:10})};
 window.__HAPIL_CONTROLS_V31329__={binding:{passives:{current:{}}}};
 vm.runInContext(read('assets/rc133/inner-final.js'),context,{filename:'assets/rc133/inner-final.js'});
 const Final=window.__HAPIL_INNER_FINAL_RC133__,Samong=window.__HAPIL_SAMONG_RC91__,shots=[];
 let serial=1;Final.bind({heroes:Samong.heroes.map(id=>({id,sprite:'hero-'+id})),locked:()=>false,bullet:(s,a,spec)=>{const q={id:serial++,sourceId:a.id,x:a.x,y:a.y,previousX:a.x,previousY:a.y,...spec};s.hostileProjectiles.push(q);shots.push(q);return q;}});
 const state=(hero='gunner')=>({zone:'cult04',gameModeV31346:'DREAM',samongUnlockedRC91:true,hp:220,maxHp:1000,time:10,x:7,y:9,activeHeroId:hero,enemies:[],hostileProjectiles:[],pendingHits:[],impactQueue:[],effects:[],floatTexts:[],fxSerial:1,bossDefeated:false,completedZones:new Set(),spawnedWaves:new Set()});
 return{window,context,Final,Samong,shots,state};
}

// Every awakened identity now launches a unique, finite pattern through the
// native projectile constructor. The shot has a visible windup before contact.
{
 const {Final,shots,state}=env(),s=state();s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});
 ok(Final.beforeDeath(s,s.enemies[0]),'Dream cult death enters hidden finale');
 const m=s.innerFinalRC133;eq(Final.snapshot(s).playerFatalAt,-1,'fresh hidden boss has no false near-lethal marker');m.intro=0;m.awakeningCooldown=10;
 const signatures=new Set();
 for(const id of ['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']){
  const a=Final.boss(s);m.hero=id;s.activeHeroId=id;m.shotDelay=0;s.hostileProjectiles=[];s.time+=1;
  const first=shots.length;Final.tick(s,.016);const wave=shots.slice(first);
  eq(wave.length,Final.traits[id].count,id+' emits its bounded authored pattern');
  ok(wave.every(q=>q.rc133InnerShot&&q.rc133Trait===id&&q.rc133Pattern===id&&q.damage>0&&q.radius<=.32),id+' shots keep ownership/damage/radius');
  ok(wave.every(q=>q.frozenUntil>=s.time+.65&&q.collisionDisabledUntil31219>=q.frozenUntil),id+' telegraph delays collision');
  const directions=wave.map(q=>Math.atan2(q.vy,q.vx).toFixed(3)).sort().join(',');signatures.add(directions);
 }
 eq(signatures.size,8,'all eight hero borrow-patterns are geometrically distinct');
 // The hostile queue cap delays a wave without losing its retry opportunity.
 m.hero='gunner';s.activeHeroId='gunner';m.shotDelay=0;s.hostileProjectiles=Array.from({length:70},(_,i)=>({id:'held-'+i}));const old=shots.length;Final.tick(s,.016);eq(shots.length,old,'full queue refuses overflow shots');
 s.hostileProjectiles=[];m.shotDelay=0;Final.tick(s,.016);eq(shots.length-old,6,'a freed queue promptly admits the pending skill');
}

// A lethal player hit close to the hidden boss's defeat becomes one saved,
// low-health paired awakening. It cannot refill a second life in that fight.
{
 const {Final,Samong,window,state}=env(),s=state('neon');s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});
 Final.beforeDeath(s,s.enemies[0]);const m=s.innerFinalRC133;m.intro=0;const a=Final.boss(s);a.hp=Math.ceil(a.maxHp*.1);s.hp=0;
 ok(Samong.tryRevive(s),'near-final player death starts the paired awakening before respawn');
 eq(Math.round(s.hp/s.maxHp*100),22,'player returns at a bounded low health');eq(Math.round(a.hp/a.maxHp*100),22,'hidden boss returns at a bounded low health');
 eq(Samong.active(s),true,'player receives the seven-second Samong awakening');eq(m.awake,7,'boss receives its opposing awakening');eq(Final.mood(s),'opposition','the arena enters the half-white/half-red duel');
 eq(s.samongPassiveRC91.encounterRC128.used,true,'the normal encounter revival token is consumed');
 const snap=Final.snapshot(s),passive=Samong.snapshot(s),restored=state('neon');restored.time=s.time;Final.restore(restored,snap);Samong.restore(restored,passive);
 const ra=Final.boss(restored);ok(restored.innerFinalRC133.clash.used&&!!ra,'native save restore retains one-use duel and both combatants');
 eq(Math.round(restored.hp/restored.maxHp*100),22,'native restore preserves duel player health');eq(Math.round(ra.hp/ra.maxHp*100),22,'native restore preserves duel boss health');
 restored.samongPassiveRC91.active=0;restored.samongPassiveRC91.cooldown=0;restored.hp=0;eq(Samong.tryRevive(restored),false,'duel token cannot grant a second lethal revival');
 ra.hp=0;eq(Final.beforeDeath(restored,ra),false,'a second boss defeat completes the hidden fight instead of replaying the clash');eq(restored.innerFinalRC133.phase,'complete','hidden finale completes after the actual final defeat');
 const modes=env();const story=state();story.gameModeV31346='STORY';story.enemies=[{id:'c104-boss',hp:0,maxHp:1500}];eq(modes.Final.beforeDeath(story,story.enemies[0]),false,'Story cult death is unchanged');
}

// If the normal lethal revival wins first, a boss defeat inside the same
// short transaction window upgrades that existing awakening without a second
// activation, cut-in, or cooldown claim. The pending lethal marker survives a
// native save/load while the duel is unresolved.
{
 const {Final,Samong,state}=env(),s=state('hunter');s.enemies.push({id:'c104-boss',hp:0,maxHp:1500,x:22,y:8,boss:true});Final.beforeDeath(s,s.enemies[0]);const m=s.innerFinalRC133;m.intro=0;const a=Final.boss(s);a.hp=Math.ceil(a.maxHp*.3);s.hp=0;
 ok(Samong.tryRevive(s),'normal lethal revive remains available above the paired threshold');const activations=s.samongPassiveRC91.activations,fatalAt=m.playerFatalAt,finalSave=Final.snapshot(s),passiveSave=Samong.snapshot(s);
 eq(finalSave.playerFatalAt,fatalAt,'near-lethal transaction marker is saved');const restored=state('hunter');restored.time=s.time;restored.hp=s.hp;Final.restore(restored,finalSave);Samong.restore(restored,passiveSave);const restoredBoss=Final.boss(restored);
 ok(!!restoredBoss&&restored.innerFinalRC133.playerFatalAt===fatalAt,'near-lethal marker and hidden boss restore together');restoredBoss.hp=0;
 ok(Final.beforeDeath(restored,restoredBoss),'near-simultaneous boss defeat upgrades the existing awakening');eq(Samong.active(restored),true,'existing player awakening stays active');eq(restored.samongPassiveRC91.activations,activations,'upgrade does not admit a second player awakening');eq(Math.round(restored.hp/restored.maxHp*100),22,'upgraded player remains at bounded health');eq(Math.round(restoredBoss.hp/restoredBoss.maxHp*100),22,'upgraded boss returns at bounded health');eq(Final.mood(restored),'opposition','upgrade enters opposing arena treatment');
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
