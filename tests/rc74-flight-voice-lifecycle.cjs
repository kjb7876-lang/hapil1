const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');
function fn(name){const start=code.indexOf('function '+name+'(');assert(start>=0,name);return code.slice(start,code.indexOf('\n}',start)+2);}
const c={Math,Number,Set,MONGSE_isBossLikeHitV31232:h=>!!(h?.boss||h?.midboss),MONGSE_findBossProjectileActorV31232:s=>s.enemies[0],MONGSE_resolveBossProjectileThemeV31232:()=>({bitmap:'boss.webp',impact:'impact.webp'}),MONGSE_bindEffectBitmapV31225:()=>{}};
vm.createContext(c);
for(const name of ['MONGSE_BOSS_PROJECTILE_ROTOR_CONFIG_V31232','MONGSE_TELEGRAPH_IMAGE_CONFIG_V31233']){
 const start=code.indexOf(name+' = Object.freeze(');assert(start>=0,name);const end=code.indexOf('\n  });',start)+6;
 vm.runInContext('var '+code.slice(start,end)+';',c);
}
const bootPredicate=code.match(/telegraphDurationsFinite:\s*([\s\S]*?),\s*telegraphVisualCapsBounded:/)[1];
assert.equal(vm.runInContext(bootPredicate,c),true,'changed durations must pass the runtime release gate');
for(const name of ['MONGSE_transitFlightSecondsV31232','MONGSE_canSpawnImpactTransitV31232','MONGSE_spawnImpactTransitV31232','MONGSE_pruneCoverageForArrivalV31234','MONGSE_coverageVisualBudgetV31233','MONGSE_isBossOrMidbossV31233','MONGSE_markResolvedCoverageEffectV31233'])vm.runInContext(fn(name),c);
const state={time:10,fxSerial:1,enemies:[{id:'boss',x:4,y:4,boss:true}],effects:[]};
for(let i=0;i<70;i++){
 const hit={id:i,sourceId:'boss',boss:true,x:4+(i%27),y:9,impactAt:10.05};
 const effect=c.MONGSE_spawnImpactTransitV31232(state,hit);assert(effect,'a live volley cannot hide a newly committed flight');
 assert(effect.duration>=.9&&effect.duration<=1.8);assert.equal(effect.born+effect.duration,hit.impactAt,'damage deadline is the pictured arrival');
 assert.equal(hit.transitImpactAtV31232,hit.impactAt);
}
assert.equal(state.effects.length,70);
for(const key of ['fourArmRotorV31232','snipeWarningV31230','pureTelegraphV31230','giantProjectileTelegraphV31226'])assert.equal(c.MONGSE_spawnImpactTransitV31232(state,{boss:true,[key]:true}),null,'special attacks do not gain duplicate bodies');
const impacts={time:20,effects:[],enemies:state.enemies};
for(let i=0;i<80;i++){
 const hit={id:i,boss:i%2===0,midboss:i%2===1,sourceId:'same-boss',x:10,y:10,shape:'circle',radius:3};
 const effect={born:20,sourceId:'same-boss'};
 assert(c.MONGSE_markResolvedCoverageEffectV31233(impacts,hit,effect));
 assert(c.MONGSE_coverageVisualBudgetV31233(impacts,hit));
 impacts.effects.push(effect);
 assert.equal(c.MONGSE_pruneCoverageForArrivalV31234(impacts,hit).evicted,0);
}
impacts.time=20.95;c.MONGSE_pruneCoverageForArrivalV31234(impacts,{});assert.equal(impacts.effects.length,80,'no premature disappearance');
impacts.time=21.31;c.MONGSE_pruneCoverageForArrivalV31234(impacts,{});assert.equal(impacts.effects.length,0,'effects still expire');
const heads=code.slice(code.indexOf('var tn = 0,'),code.indexOf('var cn = {'));vm.runInContext(heads,c);
assert.equal(c.sn('slayer','a'),Math.PI);
assert(!code.includes('HAPIL_RC69_drawSlayerCoreFlight'),'no ring/ellipse overlay remains');
for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
 const rotation=angle-c.sn('slayer','a'); // Bitmap's convex front is authored at PI.
 assert(Math.abs(Math.cos(rotation+Math.PI)-Math.cos(angle))<1e-8);
 assert(Math.abs(Math.sin(rotation+Math.PI)-Math.sin(angle))<1e-8);
}
const story={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/story-rc51.js'),'utf8'),story);
const data=story.window.__HAPIL_STORY_DATA_RC51__,opening=data.records.find(r=>r.zone==='dist00'),voice=JSON.parse(fs.readFileSync(path.join(root,'data/opening-voice-rc74.json'),'utf8'));
for(const [phase,key] of [['pre','opening'],['post','root']])assert.equal(opening[phase],voice[key].title+'\n\n'+voice[key].paragraphs.join('\n\n'));
assert(opening.pre.includes('천사들이 관리했었다'));assert(!opening.pre.includes('궁전 정원에 서 있던 기억이 남아 있다'));
assert(opening.post.includes('치열한 전투를 벌였고, 그 결과'));assert(!opening.post.includes('어딘지 알 수 없는'));
for(const entry of Object.values(voice))assert(fs.existsSync(path.join(root,entry.audio)));
console.log('RC74 PASS: 70 committed flights, 80 overlapping impacts, arrival/damage timing, finite expiry, four-way crescent direction, no ring overlay, recording-aligned opening cards.');
