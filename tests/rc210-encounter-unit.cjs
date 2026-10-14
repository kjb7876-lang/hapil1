'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const P=require('../assets/rc210/encounter-policy.js');
const src=fs.readFileSync('assets/index-v31526.js','utf8');
const start=src.indexOf(' function midpoint(s){'),end=src.indexOf(' function restartAfterDeath(s){',start);
let checks=0;
function runtime(mode){const world={window:{__HAPIL_ENCOUNTER_RC210__:P,__HAPIL_MODES_V31346__:{mode:s=>s.gameModeV31346}},cleanEncounter:(r,z)=>r?.zone===z?r:null,authoredMidboss:(z,a)=>a,fissionIdentity:()=>{},Jr:a=>({...a}),n:(v,d)=>Number.isFinite(v)?v:d,U:()=>({enabled:s=>s.gameModeV31346==='DREAM'}),HAPIL_positionMidbossDuoRC59:()=>{},metrics:{midbossAdded:0}};vm.createContext(world);vm.runInContext(src.slice(start,end)+';this.midpoint=midpoint;',world);return s=>{s.gameModeV31346=mode;world.midpoint(s);};}
const enemy=id=>({id,midboss:true,hp:100,maxHp:100,x:24,y:14,requiredForClear:true});
for(const [mode,count] of [['STORY',1],['DREAM',2],['HELL',3]]){
 const tick=runtime(mode),s={zone:'dist04',time:10,enemies:[enemy('first'),enemy('twin'),enemy('third'),{id:'ordinary',hp:20}]};
 tick(s);assert.equal(s.enemies.filter(P.hostile).length,count);assert.equal(s.midbossEncounterRC133.ids.length,count);checks++;
 const admitted=[...s.midbossEncounterRC133.ids];s.enemies=s.enemies.filter(a=>a.id!==admitted[0]);s.enemies.push(enemy('legacy-respawn'));tick(s);assert(!s.enemies.some(a=>a.id===admitted[0]||a.id==='legacy-respawn'));assert.equal(s.midbossEncounterRC133.ids.length,count);checks++;
 s.enemies.push(enemy(admitted[0]));tick(s);assert(!s.enemies.some(a=>a.id===admitted[0]));checks++;
 s.midbossEncounterRC133.members=s.enemies.filter(a=>a.midboss&&a.hp>0).map(a=>({...a}));const save=JSON.parse(JSON.stringify(s));save.enemies.push(enemy('restore-twin'));tick(save);assert(!save.enemies.some(a=>a.id==='restore-twin'));assert.equal(save.enemies.filter(P.hostile).length,count-1);checks++;
 const legacy={zone:'dist04',time:10,enemies:[enemy('second'),enemy('third')],midbossEncounterRC133:{version:1,zone:'dist04',ids:['dead','second','third'],members:[enemy('second'),enemy('third')]}};tick(legacy);assert.equal(legacy.enemies.filter(P.hostile).length,Math.min(2,count));assert(!legacy.midbossEncounterRC133.ids.includes('dead')||count===3);checks++;
 const dupe={zone:'dist04',time:10,enemies:[enemy('same'),enemy('same'),enemy('other')]};tick(dupe);assert.equal(new Set(dupe.enemies.map(a=>a.id)).size,dupe.enemies.length);checks++;
}
assert.equal(P.count('STORY'),1);assert.equal(P.count('DREAM'),2);
console.log(JSON.stringify({status:'passed',checks:checks+2,nativeMidpoint:true,scope:'CPU encounter admission, legacy migration, saved ledger, no refill; no browser or natural progression claim'}));
