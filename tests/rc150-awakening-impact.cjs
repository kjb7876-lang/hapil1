'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const calls={enemy:[],player:[],death:[],flash:[]};
const window={__HAPIL_AWAKENING_PORTRAITS_RC137__:{flash:(...args)=>calls.flash.push(args)},
 __HAPIL_COMBAT_CORE_V31401__:{enemy:(s,a,raw,source,apply)=>{calls.enemy.push({id:a.id,raw,source});return apply();},mark:()=>{},player:(s,raw,x,y,source)=>{calls.player.push({raw,source});s.hp-=raw*.5;return true;}},
 __HAPIL_RC86_BRIDGE__:{counterDamage:(s,a,raw)=>{a.hp=Math.max(0,a.hp-raw*.5);return{appliedDamage:raw*.5};}},
 __HAPIL_CONTROLS_V31329__:{binding:{state:{current:null},actions:{death:a=>calls.death.push(a.id)}}}};
vm.runInNewContext(fs.readFileSync('assets/rc150/awakening-impact.js','utf8'),{window,WeakMap,Set,Number,Math,Date});
const A=window.__HAPIL_AWAKENING_IMPACT_RC150__,s={zone:'cult04',time:8,hp:100,maxHp:200,fxSerial:1,x:2,y:3,activeHeroId:'gunner',enemies:[
 {id:'one',hp:100,maxHp:100,x:4,y:5},{id:'two',hp:2,maxHp:100,x:6,y:5},{id:'friendly',hp:50,maxHp:50,friendly:true}],floatTexts:[]};
window.__HAPIL_CONTROLS_V31329__.binding.state.current=s;
assert.equal(A.player(s,'activation-1','gunner.png','Gunner'),true);
assert.deepEqual(calls.enemy.map(x=>[x.id,x.raw]),[['one',7],['two',7]]);
assert.equal(calls.death.length,1);assert.equal(calls.death[0],'two');
assert.equal(s.enemies[0].hp,96.5);assert.equal(s.enemies[2].hp,50);
assert.equal(A.player(s,'activation-1','gunner.png','Gunner'),false);assert.equal(calls.enemy.length,2);
assert.equal(A.boss(s,{id:'persona',x:8,y:9},'boss-1','persona.png','Persona'),true);
assert.equal(calls.player[0].raw,14);assert.equal(s.hp,93);
assert.equal(A.boss(s,{id:'persona'},'boss-1','persona.png','Persona'),false);assert.equal(calls.player.length,1);
assert.equal(calls.flash.length,2);assert(s.floatTexts.some(t=>t.text.includes('각성 충격 −4')));
const spawned={id:'future',hp:100,maxHp:100};s.enemies.push(spawned);assert.equal(spawned.hp,100);
console.log('RC150_AWAKENING_IMPACT',JSON.stringify({status:'passed',enemyRequests:calls.enemy.length,bossRequests:calls.player.length,deathHooks:calls.death.length,flashEvents:calls.flash.length,policy:A.policy}));
