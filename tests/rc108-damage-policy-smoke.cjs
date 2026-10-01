const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let mobile=false,ego=false;
const window={__HAPIL_MOBILE_V31366__:{enabled:()=>mobile},__HAPIL_LASERS_V31330__:{owners:[{id:'registered-laser'}]},__HAPIL_SAMONG_RC91__:{active:()=>ego,enabled:()=>true}};
vm.runInNewContext(fs.readFileSync('assets/rc108/damage-policy.js','utf8'),{window});
const p=window.__HAPIL_DAMAGE_RC108__,s={zone:'test',time:5,activeHeroId:'neon',enemies:[{id:'ordinary'},{id:'strong-boss',boss:true}]};
for(const sourceId of ['ordinary','strong-boss','registered-laser']){
 mobile=false;assert.equal(p.incoming(s,{sourceId}),1);
 mobile=true;assert.equal(p.incoming(s,{sourceId}),.1);
 assert.equal(100*p.incoming(s,{sourceId}),10);
}
const departed={sourceId:'ordinary'};p.observe(s);s.enemies=[];
mobile=true;assert.equal(p.incoming(s,departed),.1,'recently departed hostile owner remains known through its projectile');
for(const h of [false,null,{}, {sourceId:'unknown'}, {sourceId:'ordinary',selfDamage:true}, {sourceId:'ordinary',environmentDamage:true}])assert.equal(p.incoming(s,h),1);
assert.equal(p.outgoing(100),50);assert.equal(p.outgoing(3),1.5);assert.equal(p.outgoing(0),0);assert.equal(p.outgoing(-10),-10);

ego=true;assert.equal(p.power(s,{heroId:'neon'}),7);assert.equal(p.power(s,{heroId:'hwando'}),1);
ego=false;assert.equal(p.power(s,{heroId:'neon',samongPowerMultiplierRC108:7}),7,'launched ricochet keeps its multiplier after the passive expires');
assert.equal(p.power(s,null),1,'unattributed damage never receives the hero multiplier');
const passive={time:10,samongPassiveRC91:{cooldown:77}};
assert.equal(p.egoEntered(passive,false,0,12),true);assert.ok(Math.abs(passive.samongPassiveRC91.cooldown-71.61)<1e-8);
assert.equal(p.egoEntered(passive,false,0,12),false,'duplicate notification for one EGO edge is ignored');
passive.time=11;passive.samongPassiveRC91.cooldown-=1;assert.equal(p.egoEntered(passive,false,12,13),true);assert.ok(Math.abs(passive.samongPassiveRC91.cooldown-65.6673)<1e-8);

const bundle=fs.readFileSync('assets/index-v31526.js','utf8');
const start=bundle.indexOf('function HAPIL_applyCounterDamageV31303('),end=bundle.indexOf('\nfunction HAPIL_probeCombatFlowV31303',start);
assert.ok(start>=0&&end>start,'native counter-damage implementation is present');
window.__HAPIL_RC79__={balancedDamage:(_s,_e,n)=>n};
window.__HAPIL_DANMAKU_RPG_RC88__={castDamageFactor:(_s,_e,n)=>n,damageFactor:()=>1};
const nativeContext={window,HAPIL_finiteV31303:(v,d=0)=>Number.isFinite(v)?v:d,HAPIL_bossCastDamageFactorV31342:()=>1,MONGSE_phaseGateHealth:undefined};
vm.runInNewContext(bundle.slice(start,end)+';globalThis.__apply=HAPIL_applyCounterDamageV31303;',nativeContext);
const apply=nativeContext.__apply,world={time:1,activeHeroId:'neon'},enemy={hp:1000,maxHp:1000,stagger:0,maxStagger:100};
assert.equal(apply(world,enemy,100,null,{heroId:'neon'}).appliedDamage,50,'all ordinary native outgoing hits are halved');
enemy.hp=1000;ego=true;assert.equal(apply(world,enemy,100,null,{heroId:'neon'}).appliedDamage,350,'Dream awakening applies x7 after the shared half-damage factor');
enemy.hp=1000;ego=false;assert.equal(apply(world,enemy,100,null,{heroId:'neon',samongPowerMultiplierRC108:7}).appliedDamage,350,'a launched ricochet hit retains x7');
enemy.hp=1000;assert.equal(apply(world,enemy,100,null,{heroId:'hwando'}).appliedDamage,50,'unselected party hero does not get active hero damage');

const playerDamage=bundle.slice(bundle.indexOf('function HAPIL_reducePlayerContactV31401'),bundle.indexOf('\nfunction ',bundle.indexOf('function HAPIL_reducePlayerContactV31401')+20));
assert.match(playerDamage,/__HAPIL_DAMAGE_RC108__\?\.incoming\(e,MONGSE_damageSource\)/,'player contact damage applies the mobile hostile-owner factor after existing native mitigation');
assert.match(bundle,/heroBleedSourceIdRC108=t\.sourceId/,'status damage preserves hostile owner attribution');
console.log('PASS RC108 mobile incoming source factors, hostile-owner persistence, Dream power/EGO edges, native outgoing half-damage integration, and DOT provenance.');
