const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const plugin = fs.readFileSync(path.join(root, 'assets/rc31/boss-and-mobile.js'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'assets/hapil-mobile-v31406.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/rc28/mobile-layout.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert(html.includes('boss-and-mobile.js?v=33101'), 'RC31 gameplay plugin is not loaded');
assert(html.includes('hapil-mobile-v31406.js?v=33101'), 'RC31 mobile controller cache key is stale');
assert(css.includes('object-fit:cover!important'), 'mobile canvas does not cover the full screen');
assert(/#rc24-bossbar[\s\S]*?display:none!important/.test(css), 'mobile DOM boss bar is still shown');
assert(css.includes('.game>.hapil-combat-rail-v31339'), 'mobile boss and combat UI are not hidden');
assert(mobile.includes("({battery:.32,balanced:.40,full:.52})[options.quality]"), 'mobile pixel budget has not been reduced');
assert(mobile.includes('setInterval(update,450)'), 'mobile DOM polling has not been reduced');
assert(mobile.includes("toolbar.append(button('Menu','설정'))"), 'extra mobile status HUD is still mounted');
assert(mobile.includes('saved.showCombatInfo!==false'), 'mobile pattern labels are not disabled by default');
assert(plugin.includes("this.globalCompositeOperation==='lighter'"), 'common bright laser core is not removed');

const registryMatch = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8')
  .match(/types=Object\.keys\(labels\),owners=(\[.*?\]);for\(const r of owners/);
assert(registryMatch, 'boss laser owner list missing');
const owners = JSON.parse(registryMatch[1]);
const ctx = {
  __HAPIL_LASERS_V31330__: {installed:true, owners, tick(){}, draw(renderCtx){
    renderCtx.globalCompositeOperation = 'lighter';
    renderCtx.drawImage({naturalHeight:144}, 0, 144*.38, 768, 144*.25, 0, -20, 500, 40);
  }},
  __HAPIL_BLOOD_RC16__: {draw(){return true}},
  __HAPIL_MOBILE_V31366__: {enabled:()=>false},
  __HAPIL_CHANNEL_V31364__: {active:()=>ctx.guarded===true},
  __HAPIL_COMBAT_V31333__: {core:p=>({x:p.x*27+p.y*27,y:p.y*13.5-p.x*13.5})},
  __HAPIL_PARTY_V31322__: null,
};
const window = ctx;
const runtime = vm.createContext({window, Proxy, Map, Object, Number, Math, String, setTimeout(){},});
vm.runInContext(plugin, runtime);
assert.equal(window.__HAPIL_RC31__.customBossBeams, 28, 'not every key episode/cosmic boss has custom artwork');
assert.equal(owners.find(o=>o.id==='dist06-boss').beam, './assets/vfx/rc31/boss-lasers/dist06-boss.svg');
assert.equal(owners.find(o=>o.id==='a11-cosmic-v31318').beam, './assets/vfx/rc31/boss-lasers/a11-cosmic-v31318.svg');
for (const [id,file] of Object.entries(Object.fromEntries(owners.filter(o=>window.__HAPIL_RC31__.owners.includes(o.id)).map(o=>[o.id,o.beam])))) {
  const target=path.join(root,file.replace(/^\.\//,''));
  assert(fs.existsSync(target), `${id} art missing`);
  const svg=fs.readFileSync(target,'utf8');
  assert(svg.includes(`data-owner="${id}"`), `${id} art is not owner-specific`);
  assert(svg.includes('data-motif='), `${id} art is missing its motif`);
}
const fakeCanvas={globalCompositeOperation:'source-over',calls:0,drawImage(){this.calls++;},save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},setLineDash(){}};
window.__HAPIL_LASERS_V31330__.draw(fakeCanvas,{}, {time:0,hp:100}, {});
assert.equal(fakeCanvas.calls,0, 'the shared small bright blue laser core was not suppressed');
assert.equal(window.__HAPIL_RC31__.stats().blueCoreSuppressed,1);

const state={time:1,hp:100,x:16,y:16,moveVx:0,moveVy:0,zone:'ep1b09',fxSerial:0,enemies:[{id:'b09-boss',name:'사이보그 회장',boss:true,hp:100}]};
window.__HAPIL_LASERS_V31330__.tick(state,.05);
state.time=state.bossBlackHoleNextRC31['b09-boss'];
window.__HAPIL_LASERS_V31330__.tick(state,.05);
assert.equal(state.bossBlackHolesRC31.length,1,'boss black hole was not scheduled');
const hole=state.bossBlackHolesRC31[0];
assert.equal(hole.color, owners.find(o=>o.id==='b09-boss').color, 'black hole did not use the boss colour');
state.time=hole.fireAt;state.x=hole.x-2;state.y=hole.y;
window.__HAPIL_LASERS_V31330__.tick(state,.05);
assert(state.x>hole.x-2, 'active black hole did not pull the player toward its center');
state.x=hole.x-2;state.y=hole.y;state.time+=.05;window.guarded=true;
window.__HAPIL_LASERS_V31330__.tick(state,.05);
assert.equal(state.x,hole.x-2, 'resonance failed to block the black hole pull');
assert(window.__HAPIL_RC31__.stats().resonanceBlocks>0, 'resonance defense was not recorded');

console.log('PASS: 28 boss-specific beam motifs, blue core suppression, full-screen mobile profile, and resonance-defended black-hole pull.');
