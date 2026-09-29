const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bundle = read('assets/index-v31526.js');
const html = read('index.html');
assert(Number(html.match(/index-v31526\.js\?v=(\d+)/)?.[1]) >= 37200, 'RC72 browser cache key is active');

// Rebuild the exact authored campaign graph, maps, and actor assets.
const data = {window: {}, S: (x, y) => ({x, y})};
vm.createContext(data);
const rootStart = bundle.indexOf('  le = `./`,');
const rootEnd = bundle.indexOf('var MONGSE_REST_ZONE_IDS', rootStart);
assert(rootStart >= 0 && rootEnd > rootStart, 'native map registry is present');
vm.runInContext(`var ${bundle.slice(rootStart, rootEnd)}`, data);
const prologueStart = bundle.indexOf('N.dist00 = {');
const prologueEnd = bundle.indexOf('// The terrain registry', prologueStart);
assert(prologueStart >= 0 && prologueEnd > prologueStart, 'prologue map is present');
vm.runInContext(bundle.slice(prologueStart, prologueEnd), data);
vm.runInContext(read('data/story-rc51.js'), data);
vm.runInContext(read('data/world-v31217.js'), data);
data.N.dist06.next = 'ep1a08';
const story = data.window.__HAPIL_STORY_DATA_RC51__;
const world = data.window.__MONGSE_WORLD_V31217__;
const route = story.records;
const battleRecords = route.filter(row => !row.rest);
assert.equal(battleRecords.length, 55, 'all canonical battle records are traversed');
assert.equal(route.length, 61, 'the six shelters remain interleaved in the story route');
const forward = [];
for (let zone = 'dist00'; zone && zone !== 'hub' && zone !== 'village'; zone = data.N[zone]?.next) {
  assert(!forward.includes(zone), `forward portal route loops at ${zone}`);
  forward.push(zone);
}
assert.deepEqual(forward, Array.from(route, row => row.zone), 'forward route exactly follows the authored prose records');
const fileExists = asset => typeof asset === 'string' && fs.existsSync(path.join(root, asset.replace(/^\.\//, '')));
for (const row of [...route, ...route.slice().reverse()]) {
  const map = data.N[row.zone], profile = world.zoneById[row.zone];
  assert(map && profile, `${row.zone} map and environment resolve in both traversal directions`);
  assert(fileExists(map.map), `${row.zone} map bitmap exists`);
  if (row.rest) continue;
  assert(map.enemies?.length, `${row.zone} has combat actors`);
  assert(profile.environmentKey && profile.topology && profile.hazards?.length && profile.props?.length,
    `${row.zone} has a complete authored environment profile`);
  for (const actor of map.enemies) {
    assert(actor.name?.trim(), `${row.zone}/${actor.id} has a visible actor name`);
    assert(fileExists(actor.sprite), `${row.zone}/${actor.id} art exists`);
  }
}
const hostileMaps = Object.entries(data.N).filter(([, map]) => (map?.enemies ?? []).some(actor => actor &&
  !actor.visualOnly && !actor.objectiveStructureV31238 && !actor.narrativeStructureV31238));
assert.equal(hostileMaps.length, 56, '55 story battles plus the authored EP1-A memory encounter are covered');
assert((data.N.ep1a07?.enemies ?? []).length > 0, 'the additional Episode 1-A memory encounter is present');

// Boot the production spell-card runtime against the real map table.
let mobile = false, nextId = 1;
function HAPIL_tickBossPatternsV31310() {}
function HAPIL_pushProjectile(state, actor, options) {
  state.hostileProjectiles.push({id: nextId++, sourceId: actor.id, born: state.time, ...options});
}
Object.assign(data, {
  MONGSE_ASSET_VERSION: '31526',
  window: {
    __HAPIL_COMBAT_RC47__: {mobile: () => mobile},
    __HAPIL_V31315_RELEASE__: {allPass: true},
    __HAPIL_SKILL_VISUAL_V31311__: {rankedRows: () => Array.from({length: 71}, (_, index) => ({
      actor: {id: `audit-ranked-${index}`, boss: true, hp: 100, x: 5, y: 5}, zone: 'dist00',
    }))},
    __HAPIL_GAMEPLAY_V31309__: {saveRevision: 14},
  },
  MONGSE_tickBossCombatPatternsV31230: HAPIL_tickBossPatternsV31310,
  MONGSE_tickBossThemeOrdnance() {},
  MONGSE_bossBarrageTheme: () => 'causality',
  MONGSE_bossBarragePalette: () => ({theme: 'causality', color: '#a44cff', accent: '#ffffff'}),
  MONGSE_enemyActivePhase: () => 1,
  MONGSE_bossPatternBusyV31230: () => false,
  MONGSE_isEncounterLocked31226: () => false,
  MONGSE_lockAtomicBossCast31210: () => `rc72-cast-${nextId++}`,
  MONGSE_bossDirectorProfile31210: () => ({speedScale: 1, sizeScale: 1}),
  MONGSE_pushThemeProjectile3129: HAPIL_pushProjectile,
  MONGSE_compensateGlobalTimeStop31216() {},
  MONGSE_extendProjectileTimeline31214() {},
  MONGSE_enemyAttackSfx: () => 'boss-fire.wav', We() {},
  MONGSE_zoneAssetManifest: () => new Set(),
  MONGSE_zoneAssetPlan31220: () => ({all: new Set(), A: new Set(), B: new Set(), C: new Set(), pins: new Set(), deferred: new Set()}),
  MONGSE_queueImage: () => ({complete: true, naturalWidth: 64, naturalHeight: 64}),
  MONGSE_skillFxOpacity: () => 1,
  MONGSE_spawnBossCombatPatternV31230: () => null,
  Jn() {}, Gn() {}, G: (x, y) => ({x, y}), J: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  MONGSE_enemyTorsoOffset: () => ({y: -18}), setTimeout: () => 0,
});
const danmakuStart = bundle.indexOf('/* HAPIL_V31316_DANMAKU_PATCH:');
const danmakuEnd = bundle.indexOf('/* HAPIL_V31316_CLARITY_PATCH', danmakuStart);
assert(danmakuStart >= 0 && danmakuEnd > danmakuStart, 'production danmaku block is available');
vm.runInContext(bundle.slice(danmakuStart, danmakuEnd), data);
const dm = data.window.__HAPIL_DANMAKU_V31316__;
assert(dm?.installed, 'production danmaku module installs');
assert.equal(dm.deck.length, 64, 'the spell-card catalog contains 64 named patterns');
assert.equal(dm.audit().allPass, true, JSON.stringify(dm.audit().checks));
const mapCards = dm.mapSignatures();
assert.equal(mapCards.length, 56, 'every hostile map, including ep1a07, receives a signature card');
assert.equal(new Set(mapCards.map(row => row.patternId)).size, 56, 'map first-cast spell cards are unique');
assert(mapCards.every(row => dm.catalog.some(card => card.id === row.patternId)), 'each map signature references a shipped card');

function stateFor(card) {
  const source = data.N[card.zone].enemies.find(actor => [...card.hostIds].some(id =>
    [actor.id, actor.danmakuOwnerIdV31316, actor.combatOwnerIdRC69, actor.templateId].some(key => String(key) === id)));
  assert(source, `${card.zone} signature actor resolves`);
  const actor = {...source, id: source.id, hp: Number(source.hp) || 100, maxHp: Number(source.maxHp) || 100,
    boss: !!source.boss, midboss: !!source.midboss, x: 4, y: 4};
  if (!actor.boss && !actor.midboss) actor.danmakuOwnerIdV31316 = source.id;
  return {actor,state:{zone:card.zone,time:2,hp:100,x:16,y:16,enemies:[actor],hostileProjectiles:[],pendingHits:[],impactQueue:[],bossLaserCastsV31330:[],effects:[],floatTexts:[],fxSerial:1}};
}
function planFor(card, i, isMobile) {
  const {state,actor}=stateFor(card);
  mobile = isMobile;
  const plan = dm.plan(state, actor, 'normal', i * 4, card.patternId);
  assert(plan, `${card.zone} ${card.patternId} must build in ${isMobile ? 'mobile' : 'desktop'} mode`);
  assert.equal(plan.patternId, card.patternId);
  for (const beat of plan.beats) for (const angle of beat.angles) {
    const off = Math.abs(Math.atan2(Math.sin(angle - plan.aim), Math.cos(angle - plan.aim)));
    assert(off >= plan.gap - 1e-7, `${card.zone}/${card.patternId} preserves its player-safe gap`);
  }
  if (isMobile) assert(plan.count <= 48, `${card.patternId} stays within the mobile per-cast budget`);
  return plan;
}
const plans = new Map();
for (const [traversal, cards] of [['forward', mapCards], ['reverse', mapCards.slice().reverse()]]) {
  for (const [index, card] of cards.entries()) {
    const plan = planFor(card, index, false);
    const key = plan.patternId;
    if (traversal === 'forward') plans.set(key, plan);
    else assert.equal(plan.patternId, key, 'reverse traversal preserves the same map-to-pattern binding');
  }
}
assert.equal(plans.size, 56, 'all 56 map cards build a distinct live volley');
const sampleCard = mapCards[0], sampleSource = data.N[sampleCard.zone].enemies.find(actor => [...sampleCard.hostIds].includes(actor.id));
assert(sampleSource, 'first catalog-card host actor resolves');
const sampleActor = {...sampleSource, hp: Number(sampleSource.hp) || 100, maxHp: Number(sampleSource.maxHp) || 100, x: 4, y: 4};
if (!sampleActor.boss && !sampleActor.midboss) sampleActor.danmakuOwnerIdV31316 = sampleSource.id;
const sampleState = {zone: sampleCard.zone, time: 2, hp: 100, x: 16, y: 16, enemies: [sampleActor]};
const allPlanFingerprints = [];
for (let i = 0; i < dm.deck.length; i++) {
  mobile = true;
  const p = dm.plan(sampleState, sampleActor, 'normal', i * 4);
  assert(p && p.count <= 48, `catalog card ${dm.deck[i]} has a safe mobile plan`);
  mobile = false;
  const desktop = dm.plan(sampleState, sampleActor, 'normal', i * 4);
  assert.equal(desktop.patternId, dm.deck[i]);
  allPlanFingerprints.push(desktop.beats.map(beat => beat.angles.map(a => Number(a.toFixed(5))).join(',')).join('|'));
}
assert.equal(new Set(allPlanFingerprints).size, 64, 'all 64 spell cards produce distinct angular volleys');
assert.equal(dm.barrageCap(), Infinity, 'desktop danmaku has no hard admission cap');
mobile = true; assert.equal(dm.barrageCap(), 48, 'only mobile retains the per-map cast safety cap'); mobile = false;
for (const card of mapCards) {
  const {state,actor}=stateFor(card),cast=dm.scheduleMapSignature(state);
  assert(cast?.projectiles>0, `${card.zone} schedules its unique spell card through the live projectile queue`);
  assert(state.hostileProjectiles.every(q=>q.danmakuPatternIdV31372===card.patternId), `${card.zone} queue keeps its assigned spell card`);
}

// RC75: exercise every catalog card through scheduling, delayed release and the real bitmap dispatcher.
const decodedImage={complete:true,naturalWidth:64,naturalHeight:64};data.MONGSE_queueImage=()=>decodedImage;
data.OffscreenCanvas=class {
 constructor(w,h){this.width=w;this.height=h;}
 getContext(){const canvas=this;return{drawImage(){},fillRect(){canvas.tint=this.fillStyle;},globalCompositeOperation:'source-over'};}
};
const rendered=[];
const painter={globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(image){rendered.push(image);}};
for(let i=0;i<64;i++){
 const {state,actor}=stateFor(sampleCard);
 dm.scheduleMapSignature(state);state.time+=20;dm.tick(state);state.hostileProjectiles=[];
 const cast=dm.trySchedule(state,actor,'normal',i*4);assert(cast?.projectiles>0,`card ${i} schedules`);
 assert.equal(cast.patternId,dm.deck[i]);
 const shots=[...state.hostileProjectiles],end=Math.max(...shots.map(q=>q.motionReleaseAt31219))+.4;
 while(state.time<end){state.time+=.05;dm.tick(state);}
 assert(shots.every(q=>q.bodySpawned31219&&Number.isFinite(q.vx)&&Number.isFinite(q.vy)&&Math.hypot(q.vx,q.vy)>0),`card ${i} releases all real bodies`);
 const ownerColor=shots[0].danmakuColorV31316;assert(/^hsl\([\d.]+ 96% 62%\)$/.test(ownerColor),'scheduled shots carry a distinct vivid owner color');
 assert(shots.every(q=>q.danmakuColorV31316===ownerColor),'one boss keeps the same color across its full volley');
 assert(dm.drawShot(painter,{},shots[0],state.time,{lowFx:true}));
 assert(rendered.at(-1) instanceof data.OffscreenCanvas,'low-FX renders the tinted bitmap, not only a halo');
 assert.equal(rendered.at(-1).tint,ownerColor);
}
assert(rendered.every(image=>image===rendered[0]),'repeated palette uses the cached 64px bitmap');

// Install the laser catalog on every existing hostile owner and audit the real shared geometry.
const rc72Start = bundle.indexOf('/* RC72: named spell-card danmaku');
const rc72End = bundle.indexOf('\n\n/* MONGSE v3.12.19', rc72Start);
assert(rc72Start >= 0 && rc72End > rc72Start, 'RC72 extension block is delimited');
const laserOwners = Array.from({length: 4}, (_, i) => ({id: `rc72-boss-${i}`, name: `보스 ${i}`, native: false}));
const existingProfiles = new Map(laserOwners.map(owner => [owner.id, Array.from({length: 14}, (_, i) => ({type: `old-${i}`}))]));
const laserContext = {
  window: {
    __HAPIL_LASERS_V31330__: {installed: true, types: [], labels: {}, owners: laserOwners, ranks: new Map(laserOwners.map((o, i) => [o.id, i ? 'midboss' : 'boss'])), geometry() {}, contact() {}},
    __HAPIL_LASERS_V31331__: {installed: true, profiles: existingProfiles, patternCount: 56},
    __HAPIL_BLOOD_RC16__: {installed: true, types: [], labels: {}, geometry() {}},
    __HAPIL_DANMAKU_V31316__: {installed: true, catalog: Array(64)},
  }, MONGSE_ASSET_VERSION: '31526', setTimeout: () => 0,
};
vm.createContext(laserContext);
vm.runInContext(bundle.slice(rc72Start, rc72End), laserContext);
const rc72 = laserContext.window.__HAPIL_RC72__;
assert(rc72?.audit().allPass, JSON.stringify(rc72?.audit().checks));
assert.equal(rc72.catalog.length, 64);
assert(laserOwners.every(owner => existingProfiles.get(owner.id).filter(row => row.type.startsWith('rc72-')).length === 64),
  'every boss/midboss receives all 64 additional laser recipes');
assert.equal(rc72.audit().checks.earlyLaserUse, true,
  'new laser recipes must appear in the live rotation immediately, with legacy patterns retained');
const earlyPools = laserOwners.map(owner => existingProfiles.get(owner.id).slice(0, 5));
assert(earlyPools.every(pool => pool.slice(0, 4).every(row => row.type.startsWith('rc72-'))),
  'the first four scheduled laser casts use the new pattern catalog');
assert(earlyPools.every(pool => pool.some(row => row.type.startsWith('old-'))),
  'legacy laser patterns remain in the early rotation');
assert(new Set(earlyPools.map(pool => pool[0].type)).size > 1,
  'different owners begin at different catalog patterns');

const geometryStart = bundle.indexOf(' function geometry(c,time=c.fireAt){', rc72End);
const geometryEnd = bundle.indexOf(' function canStart(s,a){', geometryStart);
assert(geometryStart > 0 && geometryEnd > geometryStart, 'production blood-laser geometry function is present');
const clip = (a, b) => {
  let lo = 0, hi = 1;
  for (const [p, d] of [[a.x, b.x - a.x], [a.y, b.y - a.y]]) {
    if (Math.abs(d) < 1e-9) { if (p < 1.1 || p > 30.9) return null; continue; }
    let u = (1.1 - p) / d, v = (30.9 - p) / d;
    if (u > v) [u, v] = [v, u];
    lo = Math.max(lo, u); hi = Math.min(hi, v);
    if (lo > hi) return null;
  }
  return {a: {x: a.x + (b.x - a.x) * lo, y: a.y + (b.y - a.y) * lo},
    b: {x: a.x + (b.x - a.x) * hi, y: a.y + (b.y - a.y) * hi}};
};
const fakeWindow = {__HAPIL_LASER_CATALOG_RC72__: laserContext.window.__HAPIL_LASER_CATALOG_RC72__, __HAPIL_LASERS_V31330__: {clip}};
const geometry = new Function('window', 'cachedGeometry', bundle.slice(geometryStart, geometryEnd) + '\nreturn geometry;')(fakeWindow, new WeakMap());
const geoFingerprint = lines => lines.map(l => [l.a.x,l.a.y,l.b.x,l.b.y].map(x => Number(x.toFixed(4))).join(',')).join('|');
const fingerprints = new Set();
for (const pattern of rc72.catalog) {
  const cast = {id: 7, type: pattern.type, cx: 16, cy: 16, radius: 24, width: .29, fireAt: 2, activeSeconds: 1.42};
  const lines = geometry(cast, cast.fireAt);
  assert(lines.length > 0, `${pattern.type} must produce real beam segments`);
  assert(lines.every(line => [line.a, line.b].every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 1.1 - 1e-6 && p.x <= 30.9 + 1e-6 && p.y >= 1.1 - 1e-6 && p.y <= 30.9 + 1e-6)), `${pattern.type} stays inside the playable arena`);
  fingerprints.add(geoFingerprint(lines));
  if (rc72.geometry.isAnimated(pattern.type)) {
    const atMid = geometry(cast, cast.fireAt + cast.activeSeconds / 2);
    assert.notEqual(geoFingerprint(lines), geoFingerprint(atMid), `${pattern.type} moves during its active beam`);
  }
}
assert.equal(fingerprints.size, 64, 'all 64 laser cards have distinct clipped collision geometry');
for (const pattern of rc72.catalog) for (const [cx,cy] of [[13.3,13.3],[13.3,18.7],[18.7,13.3],[18.7,18.7]]) {
  const lines=geometry({id:11,type:pattern.type,cx,cy,radius:24,width:.29,fireAt:2,activeSeconds:1.42},2);
  assert(lines.length>0,`${pattern.type} remains drawable at arena-edge boss anchors`);
  assert(lines.every(line=>[line.a,line.b].every(p=>p.x>=1.1-1e-6&&p.x<=30.9+1e-6&&p.y>=1.1-1e-6&&p.y<=30.9+1e-6)),
    `${pattern.type} clips every edge-anchor segment to the arena`);
}

// The card advertised as a near-total field curtain must actually cover 99%
// using the production coverage-based width calculator and the live geometry.
fakeWindow.__HAPIL_BLOOD_RC16__ = {geometry};
fakeWindow.__HAPIL_COMBAT_V31333__ = {core: p => ({x:(p.x-p.y)*27,y:(p.x+p.y)*13.5})};
fakeWindow.__HAPIL_CONTACT_V31336__ = {cfg:{bodyRadius:4.5}};
const sizingStart = bundle.indexOf(' function sizing(c,profile){');
const sizingEnd = bundle.indexOf(' function configure(c,a,profile,s)', sizingStart);
assert(sizingStart > 0 && sizingEnd > sizingStart, 'production laser sizing function is present');
const sizer = new Function('window','tier','NUM','CL',bundle.slice(sizingStart,sizingEnd)+'\nreturn sizing;')(
  fakeWindow, () => 'boss', (value,fallback=0) => Number.isFinite(Number(value)) ? Number(value) : fallback,
  (value,min,max) => Math.max(min,Math.min(max,value)));
const laserSizerContext = {window:fakeWindow};
vm.createContext(laserSizerContext);
vm.runInContext(read('assets/rc23/laser.js'),laserSizerContext);
fakeWindow.__HAPIL_LASER_RC22__ = laserSizerContext.window.__HAPIL_LASER_RC22__;
const fieldCast={id:25,type:'rc72-sweep-08',zone:'audit',cx:16,cy:16,radius:24,width:.29,fireAt:2,activeSeconds:1.42};
const fieldProfile={bloodV31516:true,activeSeconds:1.42};
const fieldSize=sizer(fieldCast,fieldProfile);
fieldCast.width=fieldSize.width;
const fieldGeometry=geometry(fieldCast,fieldCast.fireAt);
assert(fieldGeometry.length>=18, 'the 99% curtain paints a dense full-map grid');
assert.notEqual(geoFingerprint(fieldGeometry),geoFingerprint(geometry(fieldCast,fieldCast.fireAt+.71)),
  'the wide curtain has a visible shallow ripple');
const screenPoint=p=>({x:(p.x-p.y)*27,y:(p.x+p.y)*13.5});
const pointLineDistance=(point,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/len)):0;return Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy);};
const coverageSamples=[];
for(let x=1.65;x<30.6;x+=.65)for(let y=1.65;y<30.6;y+=.65){const p=screenPoint({x,y});coverageSamples.push(Math.min(...fieldGeometry.map(line=>pointLineDistance(p,screenPoint(line.a),screenPoint(line.b)))));}
const fullFieldCoverage=coverageSamples.filter(distance=>distance<=fieldSize.width*27+4.5+1e-7).length/coverageSamples.length;
assert(fullFieldCoverage>=.99,`the labeled 99% laser curtain covers ${(fullFieldCoverage*100).toFixed(1)}% of the arena`);

const baseGeometryStart = bundle.indexOf(' function geometry(c,time){if(c.bloodV31516)', 0);
const baseGeometryEnd = bundle.indexOf(' function dist(p,a,b){', baseGeometryStart);
const baseGeometry = new Function('window','tier','CL','local','clip',bundle.slice(baseGeometryStart,baseGeometryEnd)+'\nreturn geometry;')(
  fakeWindow,()=> 'boss',(x,a,b)=>Math.max(a,Math.min(b,x)),(p,c)=>({x:c.cx+p[0]/2+p[1],y:c.cy-p[0]/2+p[1]}),clip);
const contactStart = bundle.indexOf(' function contact(c,a,time){', baseGeometryStart);
const contactEnd = bundle.indexOf(' function assets(z){', contactStart);
const dist = (p, a, b) => {
  const dx=b.x-a.x,dy=b.y-a.y,ll=dx*dx+dy*dy,t=ll?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/ll)):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
};
const contact = new Function('window','geometry','halfWidth','G','dist',bundle.slice(contactStart,contactEnd)+'\nreturn contact;')(
  {__HAPIL_COMBAT_V31333__:{core:p=>({x:p.x,y:p.y})},__HAPIL_CONTACT_V31336__:{cfg:{bodyRadius:0}}},
  baseGeometry,c=>c.width*27,(x,y)=>({x,y}),dist);
const probe={id:19,type:rc72.catalog[37].type,cx:16,cy:16,radius:24,width:.29,fireAt:2,activeSeconds:1.42};
const firstLine=baseGeometry(probe,2)[0],hitPoint={x:(firstLine.a.x+firstLine.b.x)/2,y:(firstLine.a.y+firstLine.b.y)/2};
assert(contact(probe,hitPoint,2), 'laser damage contact queries the exact same generated lines as the bitmap warning');
for (const pattern of rc72.catalog) {
  const cast={...probe,type:pattern.type},line=baseGeometry(cast,2)[0],midpoint={x:(line.a.x+line.b.x)/2,y:(line.a.y+line.b.y)/2};
  assert(contact(cast,midpoint,2),`${pattern.type} beam centerline produces a live collision hit`);
}

console.log('RC73 PASS: 55 story battles plus the EP1-A memory encounter audited in both directions; 64 spell cards and 64 laser geometries tested for PC/mobile budgets, early live use, edge clipping, 99% field coverage, moving shared collision geometry, and map routing.');
