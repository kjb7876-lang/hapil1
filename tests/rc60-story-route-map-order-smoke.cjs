const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),bundle=read('assets/index-v31526.js');
function world(){
 const c={window:{},S:(x,y)=>({x,y})};vm.createContext(c);
 const a=bundle.indexOf('  le = `./`,');
 vm.runInContext('var '+bundle.slice(a,bundle.indexOf('var MONGSE_REST_ZONE_IDS',a)),c);
 const start=bundle.indexOf('N.dist00 = {');
 vm.runInContext(bundle.slice(start,bundle.indexOf('// The terrain registry',start)),c);
 vm.runInContext(read('data/story-rc51.js'),c);
 c.he=Object.values(c.N).filter(z=>!z.rest&&!['hub','village'].includes(z.id)).map(z=>z.id);
 c.window.__HAPIL_RC59_RELEASE__={installed:true};
 vm.runInContext(bundle.slice(bundle.indexOf('/* RC60:')),c);
 return c;
}
const c=world(),story=c.window.__HAPIL_STORY_DATA_RC51__;
assert.equal(story.records.length,61);assert.equal(story.records.filter(r=>!r.rest).length,55);
assert.deepEqual(Array.from(story.records,r=>r.index),Array.from({length:61},(_,i)=>i+1));
assert(!story.raw.includes('[08-삭제된기록]'));assert(!c.he.includes('ep1a07'));
assert.equal(c.N.dist06.next,'ep1a08');
let z='dist00',route=[];while(z&&z!=='hub'&&z!=='village') {assert(!route.includes(z),`route cycle: ${z}`);route.push(z);z=c.N[z]?.next;}
assert.deepEqual(route,Array.from(story.records,r=>r.zone),'every story record must follow the native portal sequence');
for(const r of story.records){
 assert(c.N[r.zone],`missing zone ${r.zone}`);
 for(const e of c.N[r.zone].enemies){
  assert(fs.existsSync(path.join(root,e.sprite)),`${r.zone}/${e.id} missing sprite: ${e.sprite}`);
 }
}
const byId=new Map(story.records.map(r=>[r.zone,r]));
assert(byId.get('dist04').pre.includes('악마화된 적'));
assert.equal(byId.get('dist04').post,'동료들마저 쓰러뜨리고');assert(!byId.get('dist05').pre.includes('동료들마저'));
assert(byId.get('dist06').post.includes('추락하게 되었다'));assert.equal(byId.get('ep1a08').index,8);
assert(byId.get('ep1a09').postBackdrop.endsWith('/dist06.webp'));
assert(c.N.dist02.enemies.some(e=>e.name.includes('되살아난 전우')&&e.sprite.endsWith('corrupted_guardian.webp')));
const old={zone:'ep1a07',frontierZone:'ep1a07',enemies:[{id:'old',hp:3}],completedZones:['dist06','ep1a07'],spawnedWaves:[1,2,3],bossDefeated:true,hp:82,shards:300};
const save=c.HAPIL_migrateDeletedRecordRC60(old);
assert.equal(save.zone,'ep1a08');assert.equal(save.frontierZone,'ep1a08');assert(!save.enemies);assert(!save.bossDefeated);assert.equal(save.shards,300);assert.equal(save.hp,82);assert.equal(old.zone,'ep1a07');assert.deepEqual(Array.from(save.completedZones),['dist06']);
assert.deepEqual(c.HAPIL_migrateDeletedRecordRC60(save),save,'migration must be idempotent');
// Exercise both startup schedules using the actual installer code and renderer selector.
const legacy=bundle.slice(bundle.indexOf('/* HAPIL_MAP_ART_V31345 */'),bundle.indexOf('/* HAPIL_GEOMETRY_V31345:'));
// Extract only the map module, before its separate projectile patch.
const mapStart=bundle.indexOf("    dist00: './assets/maps/rc53/dist00-demon-tree.webp'");
const map54Start=bundle.lastIndexOf(';(() => {',mapStart);
const map54End=bundle.indexOf('\n})();',mapStart)+7;
const map54=bundle.slice(map54Start,map54End);
const map56=bundle.slice(bundle.indexOf('/* RC56:'),bundle.indexOf('/* RC59:'));
const selector=bundle.match(/function mapFor\(s,fallback\) \{[^\n]+/)[0];
for(const delayed of [false,true]){
 const w=world(),queue=[];
 w.setTimeout=fn=>queue.push(fn);
 w.window.__HAPIL_V31344_RELEASE__={installed:!delayed};
 w.MONGSE_zoneAssetManifest=id=>new Set([w.N[id].map]);
 w.MONGSE_zoneAssetPlan31220=id=>Object.fromEntries(['all','A','B','C','deferred','pins'].map(k=>[k,new Set([w.N[id].map])]));
 vm.runInContext(legacy,w);vm.runInContext(map54,w);vm.runInContext(map56,w);
 w.window.__HAPIL_V31344_RELEASE__.installed=true;queue.forEach(fn=>fn());
 vm.runInContext(selector,w);
 for(const [id,asset] of Object.entries({...w.window.__HAPIL_MAP_ART_RC54__.rows,...w.window.__HAPIL_MAP_ART_RC56__.rows})){
  assert.equal(w.N[id].map,asset,`${id} active map after delayed=${delayed}`);
  assert.equal(w.mapFor({zone:id},'wrong'),asset,`${id} renderer overrides after delayed=${delayed}`);
  assert(w.MONGSE_zoneAssetManifest(id).has(asset));
  for(const key of ['A','all','pins'])assert(w.MONGSE_zoneAssetPlan31220(id)[key].has(asset));
  assert(fs.existsSync(path.join(root,asset)));
 }
}
const fallbacks=bundle.slice(bundle.indexOf('  function sameArcMapPaths(state) {'),bundle.indexOf('  function visibleHeroRows'));
const f={uniquePaths:a=>[...new Set(a)],desiredMapPath:()=>'/hospital.png',mapPathsForZone:()=>['/hospital.png']};
vm.createContext(f);vm.runInContext(fallbacks,f);assert.deepEqual(Array.from(f.sameArcMapPaths({zone:'ep1a08'})),['/hospital.png']);
console.log('RC60 PASS: contiguous 61 records / 55 battles, full portal sequence and enemy asset paths, deleted-save migration, medieval memory, and both map installer schedules.');
