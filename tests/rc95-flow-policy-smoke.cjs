// Behavioral invariants of the shared cadence and damage scaling contracts.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={__HAPIL_LASERS_V31330__:{ranks:new Map([['boss','boss']])}},sandbox={window,Math,Number,Object,WeakMap,WeakSet,Set};
vm.runInNewContext(fs.readFileSync('assets/rc95/combat-flow.js','utf8'),sandbox);
const R=window.__HAPIL_COMBAT_FLOW_RC95__,s={zone:'dist00',time:40,hp:240,gameModeV31346:'STORY'},a={id:'boss',boss:true,hp:100,maxHp:100};s.enemies=[a];
assert.equal(R.phase(s).index,0);s.time=45.999;assert.equal(R.phase(s).index,0);s.time=46;assert.equal(R.phase(s).index,1);s.time=52;assert.equal(R.phase(s).index,2);s.time=58;assert.equal(R.phase(s).index,0);s.time=64;assert.equal(R.phase(s).index,1);
assert(!R.admit(s,a,'bullet'));assert(!R.admit(s,a,'laser'),'an independent boss scheduler cannot claim the director slot');assert(R.run(s,()=>R.admit(s,a,'laser')));assert(!R.executing(s));assert.throws(()=>R.run(s,()=>{throw Error('cast');}));assert(!R.executing(s),'a rejected cast releases the dispatch scope');
const restored={...s,time:0,rc95CombatFlow:{version:1,zone:'dist00',startedAt:-9.25}};assert.equal(R.phase(restored).index,1);assert(Math.abs(R.phase(restored).remaining-2.75)<1e-8);restored.time=-20;assert.equal(R.phase(restored).index,0,'clock rollback starts a new encounter');
const ordinary={...s,enemies:[{id:'ordinary',hp:100}]};assert(R.allowed(ordinary,'bullet'),'a room without laser owners never waits through an empty laser phase');
const hero={id:'hwando',skills:[]},api={heroes:[hero],growth:r=>r,mastery:()=>({cooldownMultiplier:1,powerMultiplier:1}),basic:()=>({powerMultiplier:1,strikeCount:1}),skill:()=>({damageMultiplier:1}),infinite:()=>({cooldownMultiplier:1,powerMultiplier:1}),order:()=>1,ultimate:()=>400};
assert.doesNotThrow(()=>R.balance(s,{},undefined),'an early frame waits safely for native formula installation');
const ranks=[{}, {elite:true}, {midboss:true}, {boss:true}, {boss:true,phaseCount:4}];let last=0;
for(const flags of ranks){const w={...s,time:1,activeHeroId:'hwando',enemies:[{id:'rank',hp:100,maxHp:100,...flags}]};R.balance(w,{},api);const e=w.enemies[0];assert(e.maxHp>last,'higher combat ranks have higher health with the same player');last=e.maxHp;e.hp-=7;const before=e.hp,max=e.maxHp;R.balance(w,{damage:3},api);assert.equal(e.hp,before);assert.equal(e.maxHp,max,'upgrading mid-fight never rescales or heals the current target');}
const ally={id:'ally',friendly:true,hp:55,maxHp:100},aw={...s,enemies:[ally]};R.balance(aw,{},api);assert.equal(ally.hp,55);assert.equal(ally.maxHp,100,'friendly narrative actors keep their authored health');
vm.runInNewContext(fs.readFileSync('assets/combat-v31412/skill-completion.js','utf8'),{window,Math,Number,Object,WeakMap,Set});
const K=window.__HAPIL_SKILL_COMPLETION_V31412__;assert.equal(K.scaleBasicDamage(350,{actionKey:'A'}),100);assert.equal(K.scaleBasicDamage(350,{actionKey:'Q',basicChainRC95:true}),100,'A-triggered Q echoes follow the same faster-attack DPS normalization');assert.equal(K.scaleBasicDamage(350,{actionKey:'Q'}),350,'a separately cast Q retains full skill damage');
console.log('RC95 PASS: exact six-second phases, exclusive admission, thrown-cast cleanup, resume/rollback, rank order, stable wounded HP, and one normalization for all A-generated damage.');
