'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function runtime(){
 const window={__HAPIL_COMBAT_CORE_V31401__:{step(){return true;}},dispatchEvent(){}};
 const context={window,globalThis:window,localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,Math,Number,Object,Array,Map,WeakMap,WeakSet,Set,JSON,Event:function(){}};
 vm.runInNewContext(read('assets/rc128/awakening-policy.js'),context,{filename:'awakening-policy.js'});
 vm.runInNewContext(read('assets/rc133/samong-policy.js'),context,{filename:'samong-policy.js'});
 // RC91, RC128 and RC133 run unmodified; only rendering/core feedback is stubbed.
 vm.runInNewContext(read('assets/rc91/samong-awakening.js'),context,{filename:'samong-awakening.js'});
 return {window,api:window.__HAPIL_SAMONG_RC91__,context};
}
const cases=[];const check=(name,fn)=>{fn();cases.push(name);};
let r=runtime(),state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist00',activeHeroId:'hwando',time:12,hp:0,maxHp:240,awakeningUntil:0};
check('eligible lethal event revives immediately',()=>{assert.equal(r.api.canRevive(state),true);assert.equal(r.api.tryAutomaticRevival(state),true);assert.equal(state.hp,120);assert.equal(state.samongPassiveRC91.revivalCooldown,77);assert.equal(state.samongPassiveRC91.encounterRC128.used,true);assert.equal(state.samongPassiveRC91.activations,1);assert.equal(r.api.deathPending(state),false);});
check('same lethal event cannot spend twice after revival',()=>{state.hp=0;assert.equal(r.api.tryAutomaticRevival(state),false);assert.equal(state.samongPassiveRC91.activations,1);assert.equal(state.samongPassiveRC91.revivalCooldown,77);});
r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist00',activeHeroId:'hwando',time:20,hp:0,maxHp:300,awakeningUntil:0};
check('simultaneous reentrant callbacks reserve exactly one revival',()=>{
 const original=r.window.__HAPIL_SAMONG_POLICY_RC133__,nested=[];let admissions=0;
 r.window.__HAPIL_SAMONG_POLICY_RC133__={...original,admit(s,m,origin){admissions++;const ok=original.admit(s,m,origin);nested.push(r.api.tryAutomaticRevival(s));nested.push(r.api.tryAutomaticRevival(s));return ok;}};
 assert.equal(r.api.tryAutomaticRevival(state),true);assert.deepEqual(nested,[false,false]);assert.equal(admissions,1);assert.equal(state.hp,150);assert.equal(state.samongPassiveRC91.activations,1);assert.equal(state.samongPassiveRC91.encounterRC128.used,true);
});
r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:false,zone:'dist00',activeHeroId:'hwando',time:30,hp:0,maxHp:240};
check('unqualified player keeps the existing death choice path',()=>{assert.equal(r.api.canRevive(state),false);assert.equal(r.api.tryAutomaticRevival(state),false);assert.equal(state.hp,0);assert.equal(r.api.deathPending(state),true);assert.equal(state.samongPassiveRC91?.activations??0,0);});
r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist00',activeHeroId:'hwando',time:40,hp:0,maxHp:240,samongPassiveRC91:{version:1,revivalCooldown:3,origin:'revival',cooldown:3,encounterRC128:{version:1,zone:'dist00',used:false}}};
check('active reuse cooldown preserves the death route',()=>{assert.equal(r.api.canRevive(state),false);assert.equal(r.api.tryAutomaticRevival(state),false);assert.equal(state.hp,0);assert.equal(state.samongPassiveRC91.encounterRC128.used,false);});
r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist00',activeHeroId:'hwando',time:50,hp:0,maxHp:240,samongPassiveRC91:{version:1,revivalCooldown:0,encounterRC128:{version:1,zone:'dist00',used:true}}};
check('spent encounter charge preserves the death route',()=>{assert.equal(r.api.canRevive(state),false);assert.equal(r.api.tryAutomaticRevival(state),false);assert.equal(state.hp,0);assert.equal(state.samongPassiveRC91.encounterRC128.used,true);});
r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist01',activeHeroId:'hwando',time:51,hp:0,maxHp:240,samongPassiveRC91:{version:1,revivalCooldown:0,encounterRC128:{version:1,zone:'dist00',used:true}}};
check('eligibility check synchronizes a newly entered encounter before claiming its charge',()=>{assert.equal(r.api.canRevive(state),true);assert.equal(state.samongPassiveRC91.encounterRC128.zone,'dist01');assert.equal(state.samongPassiveRC91.encounterRC128.used,false);assert.equal(r.api.tryAutomaticRevival(state),true);assert.equal(state.samongPassiveRC91.encounterRC128.used,true);assert.equal(state.hp,120);});
 r=runtime();state={gameModeV31346:'DREAM',samongUnlockedRC91:true,zone:'dist00',activeHeroId:'hwando',time:55,hp:0,maxHp:240};
check('existing checkpoint selection is never replaced by auto revival',()=>{assert.equal(r.api.chooseRevival(state,'checkpoint'),true);assert.equal(r.api.tryAutomaticRevival(state),false);assert.equal(r.api.deathPending(state),false);assert.equal(r.api.consumeCheckpoint(state),true);});
check('lethal transaction owns immediate auto revive before React death choice',()=>{const bundle=read('assets/index-v31526.js'),start=bundle.indexOf('function HAPIL_reducePlayerContactV31401('),hit=bundle.indexOf('(e.hp -= a)',start),auto=bundle.indexOf('tryAutomaticRevival?.(e)',hit),death=bundle.indexOf('function HAPIL_DeathChoiceRC137',auto);assert(start>=0&&hit>start&&auto>hit&&death>auto);});
check('status-dot lethal damage also auto revives after its damage transaction',()=>{const bundle=read('assets/index-v31526.js'),start=bundle.indexOf('function MONGSE_tickSevenSinHeroEffects(e)'),hook=bundle.indexOf('if(e.hp<=0)window.__HAPIL_SAMONG_RC91__?.tryAutomaticRevival?.(e);',start),end=bundle.indexOf('return { bleedTicks:',hook);assert(start>=0&&hook>start&&end>hook);});
check('one-use ledger gate is distinct from the seven-percent and red 2.38% packet contracts',()=>{const source=read('assets/rc91/samong-awakening.js'),impact=read('assets/rc150/awakening-impact.js'),persona=read('assets/rc133/inner-final.js');assert(source.includes('revivalCooldown'));assert(impact.includes('n(a.maxHp)*.0238'));assert(impact.includes('Math.round(n(a.maxHp)*.07)'));assert(persona.includes('m.redTimeSeed/4294967296<.66'));});
check('portrait pause returns before combat clock and active simulation frame',()=>{const bundle=read('assets/index-v31526.js'),hidden=bundle.indexOf('if(document.hidden){t=requestAnimationFrame(i);return;}'),paused=bundle.indexOf('if(window.__HAPIL_ORIENTATION_PAUSE_RC152__?.sync?.()){t=requestAnimationFrame(i);return;}',hidden),clock=bundle.indexOf('(o.time += a)',paused),simulation=bundle.indexOf('window.__HAPIL_COMBAT_V31343__?.tick(o,HAPIL_heroDeltaRC51)',paused);assert(hidden>=0&&paused>hidden&&clock>paused&&simulation>paused);});
console.log(JSON.stringify({status:'passed',assertions:cases.length,checks:cases}));
