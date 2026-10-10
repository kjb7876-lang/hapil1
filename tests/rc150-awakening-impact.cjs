'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const calls={enemy:[],player:[],death:[],flash:[]};
let randomCalls=0;const math=Object.create(Math);math.random=()=>{randomCalls++;return .5;};
const window={__HAPIL_AWAKENING_PORTRAITS_RC137__:{flash:(...args)=>calls.flash.push(args)},
 __HAPIL_COMBAT_CORE_V31401__:{enemy:(s,a,raw,source,apply)=>{calls.enemy.push({id:a.id,raw,source});return apply();},mark:()=>{},player:(s,raw,x,y,source)=>{calls.player.push({raw,source});s.hp-=raw*.5;return true;}},
 __HAPIL_INNER_FINAL_RC133__:{red:s=>s.redPersona===true},
 __HAPIL_RC86_BRIDGE__:{counterDamage:(s,a,raw)=>{a.hp=Math.max(0,a.hp-raw*.5);return{appliedDamage:raw*.5};}},
 __HAPIL_CONTROLS_V31329__:{binding:{state:{current:null},actions:{death:a=>calls.death.push(a.id)}}}};
vm.runInNewContext(fs.readFileSync('assets/rc150/awakening-impact.js','utf8'),{window,WeakMap,Set,Number,Math:math,Date});
const A=window.__HAPIL_AWAKENING_IMPACT_RC150__,s={zone:'cult04',time:8,hp:100,maxHp:200,fxSerial:1,x:2,y:3,activeHeroId:'gunner',enemies:[
 {id:'one',hp:100,maxHp:100,x:4,y:5},{id:'two',hp:2,maxHp:100,x:6,y:5},{id:'friendly',hp:50,maxHp:50,friendly:true}],floatTexts:[]};
window.__HAPIL_CONTROLS_V31329__.binding.state.current=s;
assert.equal(A.player(s,'activation-1','gunner.png','Gunner'),true);
assert.deepEqual(calls.enemy.map(x=>[x.id,x.raw]),[['one',7],['two',7]]);
assert.equal(calls.death.length,1);assert.equal(calls.death[0],'two');
assert.equal(s.enemies[0].hp,96.5);assert.equal(s.enemies[2].hp,50);
assert.equal(A.player(s,'activation-1','gunner.png','Gunner'),false);assert.equal(calls.enemy.length,2);
const persona={id:'inner-evil-rc133',hp:1000,maxHp:1000,x:8,y:9};s.enemies.push(persona);s.redPersona=true;
const defenseRollsBefore=randomCalls;
assert.equal(A.player(s,'activation-red','persona.png','Persona'),true);
const redRequest=calls.enemy.find(x=>x.id===persona.id);
assert.equal(redRequest.raw,23.8,'red Persona awakening applies 2.38% of max HP, not the ordinary 7% packet');
assert.equal(redRequest.source.personaGuaranteedRC151,true,'red Persona damage is identified separately from ordinary awakening impact');
assert.equal(randomCalls,defenseRollsBefore,'red Persona awakening does not use the separate ordinary-attack 66% block roll');
assert.equal(persona.hp,988.1,'native resistance still owns the final applied damage');
assert(s.floatTexts.some(t=>t.text.includes('최대 HP 2.38%')),'damage feedback names the 2.38% red Persona rule');
assert.equal(A.player(s,'activation-red','persona.png','Persona'),false);assert.equal(persona.hp,988.1,'red Persona impact cannot duplicate');
assert.equal(A.boss(s,{id:'persona',x:8,y:9},'boss-1','persona.png','Persona'),true);
assert.equal(calls.player[0].raw,14);assert.equal(s.hp,93);
assert.equal(A.boss(s,{id:'persona'},'boss-1','persona.png','Persona'),false);assert.equal(calls.player.length,1);
assert.equal(calls.flash.length,3);assert(s.floatTexts.some(t=>t.text.includes('각성 충격 −4')));
const spawned={id:'future',hp:100,maxHp:100};s.enemies.push(spawned);assert.equal(spawned.hp,100);
console.log('RC150_AWAKENING_IMPACT',JSON.stringify({status:'passed',enemyRequests:calls.enemy.length,bossRequests:calls.player.length,deathHooks:calls.death.length,flashEvents:calls.flash.length,ordinaryAwakeningMaxHpPercent:7,redPersonaAwakeningMaxHpPercent:2.38,redPersonaDefenseRolls:randomCalls-defenseRollsBefore,policy:A.policy}));
