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
// Exercise the complete native outgoing reducer so EGO, Samong, and the final
// half-damage policy are tested together against a boss-like target.
const outgoingRoot={__HAPIL_COMBAT_CORE_V31401__:{enemy:(_s,_e,_damage,_source,run)=>run(),computed(){},mark(){},outgoingHeal(){}},__HAPIL_DAMAGE_RC108__:p};
const outgoingContext={window:outgoingRoot,globalThis:outgoingRoot};vm.runInNewContext(fs.readFileSync('assets/combat-v31412/outgoing-native.js','utf8'),outgoingContext);
const noop=()=>{},bossTarget={id:'audit-boss',hp:10000,maxHp:10000,stagger:0,maxStagger:1000,invulnerableUntil:0,boss:true,midboss:false};
const outgoingState={time:1,activeHeroId:'neon',awakeningUntil:100,enemies:[bossTarget],combo:0,counterUntil:0,damageBuffUntil:0,hp:100,maxHp:100,floatTexts:[],fxSerial:1,effects:[]},P={current:outgoingState},R={current:{damage:0}},Re={current:null};
const deps={MONGSE_objectiveDamageAllowedV31309:()=>true,HAPIL_claimCounterWindowV31303:()=>null,sr:()=>({damageMultiplier:1.3}),ir:()=>1,HAPIL_effectiveGrowthV31400:()=>({}),gr:()=>({level:0,powerMultiplier:1}),MONGSE_infiniteStats:()=>({powerMultiplier:1}),MONGSE_heroOutgoingModeMultiplier31213:()=>1,HAPIL_applyCounterDamageV31303:apply,MONGSE_triggerEnemyBreak:noop,HAPIL_awardComboMilestoneV31303:noop,HAPIL_bindDamageHitV31315:e=>e,MONGSE_attachEffectTarget:e=>e,MONGSE_beginNarrativeAttack:noop,MONGSE_enemyPhase:()=>1,MONGSE_enemyActivePhase:()=>1};
const attack=outgoingContext.window.__HAPIL_OUTGOING_V31402__.create({P,R,Re,Ke:noop,native:deps});let attackTime=1;
function outgoingHit(samong,source={heroId:'neon'}){ego=samong;outgoingState.time=attackTime++;outgoingState.combo=0;outgoingState.counterUntil=0;outgoingState.damageBuffUntil=0;bossTarget.hp=bossTarget.maxHp;bossTarget.stagger=0;bossTarget.staggerUntil=0;bossTarget.invulnerableUntil=0;attack(bossTarget,100,'#fff',false,0,source);return bossTarget.maxHp-bossTarget.hp;}
const egoOnly=outgoingHit(false),egoAndSamong=outgoingHit(true),unattributedSamong=outgoingHit(true,{});
assert.equal(egoOnly,65,'the EGO ×1.3 multiplier is applied once before the final ×0.5');assert.equal(egoAndSamong,455,'Samong adds ×7 exactly once on top of the same EGO ×1.3 and final ×0.5');assert.equal(unattributedSamong,65,'missing hero provenance cannot leak ×7');
// Exercise the actual status tick, including attribution retained after the
// hostile owner leaves the active enemy list.
const dotStart=bundle.indexOf('function MONGSE_tickSevenSinHeroEffects(e)'),dotEnd=bundle.indexOf('\nfunction MONGSE_clearSevenSinTransientState',dotStart);assert(dotStart>=0&&dotEnd>dotStart,'native status damage tick is available');
const dotContext={window:{__HAPIL_SAMONG_RC91__:{protected:()=>false,incomingFactor:()=>1,incomingBuff:()=>1},__HAPIL_DAMAGE_RC108__:p},MONGSE_COMBAT_PHYSICS_V3128:{enemyDamageMultiplier:1.3},MONGSE_limitHeroDamage31213:(_s,amount)=>({applied:amount})};vm.runInNewContext(bundle.slice(dotStart,dotEnd)+';globalThis.tick=MONGSE_tickSevenSinHeroEffects;',dotContext);
function burn(sourceId,isMobile){mobile=isMobile;const s={zone:'test',time:1,hp:100,maxHp:100,invulnerableUntil:0,enemies:[{id:'burn-owner',boss:true}],heroBurnSourceIdRC108:sourceId,heroBurnUntil:2,heroBurnNextAt:1,floatTexts:[],fxSerial:1};p.observe(s);s.enemies=[];dotContext.tick(s);return 100-s.hp;}
const desktopBurn=burn('burn-owner',false),mobileBurn=burn('burn-owner',true),unattributedBurn=burn(null,true);
assert.equal(desktopBurn,4,'native burn retains the baseline capped damage');assert.ok(Math.abs(mobileBurn-desktopBurn*.1)<1e-9,'mobile burn uses ×0.1 even after its boss owner departs');assert.equal(unattributedBurn,desktopBurn,'unattributed/environmental DOT is not reduced as hostile damage');
console.log('PASS RC108 mobile incoming source factors, hostile-owner persistence, Dream power/EGO edges, native outgoing half-damage integration, and DOT provenance.');
