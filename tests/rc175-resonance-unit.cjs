'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('assets/index-v31526.js','utf8'),start=source.indexOf(' function reduceHealV31401(s,a,amount)'),end=source.indexOf('\n function queueEcho(',start);
const root={document:{hidden:false},metrics:{healed:0},n:(v,d=0)=>Number.isFinite(v)?v:d};root.window=root;vm.createContext(root);vm.runInContext(source.slice(start,end),root);
root.__HAPIL_LOOP_V31365__={heal:root.reduceHealV31401,cancelCharge:()=>{},blockReward:()=>{}};
root.__HAPIL_COMBAT_CORE_V31401__={credit:(s,a,h,fn)=>fn(),resource:()=>{},convert:(s,a,fn)=>fn(),ego:()=>{}};
for(const f of ['action-contract','resonance-channel'])vm.runInContext(fs.readFileSync('assets/controller-v31406/'+f+'.js','utf8'),root);
const native={};for(const [key,value] of Object.entries({F:[{id:'hwando'}],HAPIL_effectiveGrowthV31400:()=>({}),HAPIL_projectileVisibleV31355:()=>true,MONGSE_isEncounterLocked31226:()=>false,MONGSE_recordProjectileRemoval31215:()=>{},hi:()=>{},sr:()=>({duration:7.2,cooldown:10,profile:{name:'ego'}})}))Object.defineProperty(native,key,{get:()=>value});
const C=root.__HAPIL_CHANNEL_FACTORY_V31406__.install(native);
function state(){const s={time:1,zone:'arena',hp:10,maxHp:240,x:16,y:16,activeHeroId:'hwando',resonance:0,fxSerial:1};root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:s},phase:'game',input:{current:new Set(['KeyD'])}},hasHeldLogical:()=>true};return s;}
let s=state();assert(C.cast(s));s.time+=.1;C.tick(s);assert(Math.abs(s.hp-11.4)<1e-8);C.tick(s);assert(Math.abs(s.hp-11.4)<1e-8);
C.credit(s,s,{id:1,damage:10,born:1});assert(Math.abs(s.hp-32.4)<1e-8);C.credit(s,s,{id:1,damage:10,born:1});assert(Math.abs(s.hp-32.4)<1e-8);C.credit(s,s,{id:2,damage:40,born:1});assert(Math.abs(s.hp-81.4)<1e-8);
s.hp=239;C.credit(s,s,{id:3,damage:10,born:1});assert.equal(s.hp,240);s.hp=0;s.time+=.1;C.tick(s);assert.equal(s.hp,0);
for(const kind of ['zone','hero','clock','load']){s=state();C.cast(s);const old=s.hp;if(kind==='zone')s.zone='next';if(kind==='hero')s.activeHeroId='other';if(kind==='clock')s.time=0;else s.time+=.1;if(kind==='load'){s=JSON.parse(JSON.stringify(s));root.__HAPIL_CONTROLS_V31329__.binding.state.current=s;}C.tick(s);assert.equal(s.hp,old,kind);}
s=state();C.cast(s);s.heroHealingBlockedUntil=10;s.time+=.1;C.tick(s);C.credit(s,s,{id:4,damage:40,born:1});assert.equal(s.hp,10);
assert.equal(C.config.healPerSecond,14);assert.equal(C.config.healPerContact,21);assert.equal(C.config.heavyHealPerContact,49);
root.__HAPIL_LUCIFER_V31318__={actorFor:s=>s.cosmicActor??null,active:s=>s.cosmicActive===true};root.__HAPIL_COMBAT_RC220__={opening:a=>a?.cosmicLuciferV31318===true&&a.cosmicOpeningFiredRC220!==true};
s=state();s.resonance=100;s.cosmicActor={cosmicLuciferV31318:true,hp:500};assert.equal(C.convert(s,s),false,'mandatory Lucifer opening reserves 100 resonance');assert.equal(s.resonance,100);assert.equal(s.awakeningUntil,undefined);
s.cosmicActor.cosmicOpeningFiredRC220=true;root.__HAPIL_ARSENAL_V31318__={counterStatus:()=>({hit:{id:'blood-beam'}})};assert.equal(C.convert(s,s),false,'an active blood beam reserves the timed counter resource');assert.equal(s.resonance,100);
root.__HAPIL_ARSENAL_V31318__.counterStatus=()=>null;s.cosmicActive=true;s.cosmicActor.cosmicCycleV31318=1;assert.equal(C.convert(s,s),false,'active Lucifer fight preserves resonance for its next scheduled blood beam');assert.equal(s.resonance,100);
s.cosmicActor.cosmicCycleV31318=2;assert.equal(C.convert(s,s),true,'automatic EGO resumes after the next-beam window passes');assert.equal(s.resonance,0);assert(s.awakeningUntil>s.time);
console.log('RC175_RESONANCE_UNIT passed: channel/heal reducers, finite contacts, HP cap and cleanup plus resonance reservation for the next scheduled Lucifer blood beam.');
