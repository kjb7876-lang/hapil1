'use strict';
// Execute the actual native shake functions and final integration, plus the
// actual feedback painter. These are CPU fixtures; real frames are checked in CI.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bundle=read('assets/index-v31526.js'),native=read('assets/rc133/native-install-v2.js.txt'),feedback=read('assets/rc128/combat-feedback.js');
const base=cp.execFileSync('git',['show','346bee26788b789168fca50f63f12a09f6869c2d:assets/index-v31526.js'],{cwd:root,encoding:'utf8',maxBuffer:32e6});
function between(source,start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,'unique actual source bounds: '+start);assert.equal(source.indexOf(start,a+1),-1);return source.slice(a,b);}
const rare=between(bundle,'function MONGSE_rareScreenShakeOffset31211(e, t) {','var MONGSE_BOSS_ARENA_ATMOSPHERE_V31213');
const current=between(bundle,'function HAPIL_currentShakeOffsetV31302(state, settings = {}) {','function HAPIL_drawPriorityCombatReadabilityV31302(');
const integration=between(native,'  const stableArena233=','  const readability232=');
assert(bundle.includes(integration),'deployed native bundle contains the exact stable-view integration');
const feelStart=' function shake(s,settings={}){',feelEnd=' function audio(s,settings,play,unlocked){';
const feel=between(bundle,feelStart,feelEnd),oldFeel=between(base,feelStart,feelEnd);
let groups=0;
function test(name,fn){fn();groups++;console.log('PASS '+name);}
function context(withIntegration=true,lateFeel=false){
 const arena={enabled:s=>s?.zone==='dist01'},window={__HAPIL_BATTLE_ARENA_RC138__:arena};
 const scope={window,Math,Number,KEY:'events',n:(v,d=0)=>Number.isFinite(v)?v:d,cl:(v,a,b)=>Math.max(a,Math.min(b,v)),valid:()=>true,hidden:()=>false,party:()=>null,
  MONGSE_hashString31211:()=>0,HAPIL_finiteV31302:(v,d=0)=>Number.isFinite(v)?v:d,
  MONGSE_COMBAT_DIRECTOR_V31210:{screenShakeAttemptCooldown31211:1,screenShakeCooldown31211:2,screenShakeDuration31211:.2,screenShakeAmplitude31211:2.6}};
 vm.createContext(scope);vm.runInContext(rare+current+feel,scope);
 if(withIntegration)vm.runInContext(integration,scope);
 if(lateFeel){
  const original=between(bundle,'  const addShake=(base,s,settings)=>','  MONGSE_SFX_PROFILE=');
  vm.runInContext('(()=>{'+original+'})();',scope);
 }
 return scope;
}
const world=zone=>({zone,time:10,hp:240,maxHp:240,screenShakeCue31211:{id:'committed-native-cue',born:9,expiresAt:11},events:[{kind:'hurt',slot:'__host',born:9.95,strength:1,angle:.5}]});
const plain=v=>JSON.parse(JSON.stringify(v));
test('original world and overlay shake is reproduced before the final wrapper',()=>{
 const C=context(false),s=world('dist01');
 assert(Math.hypot(C.MONGSE_rareScreenShakeOffset31211(s,{}).x,C.HAPIL_currentShakeOffsetV31302(s,{}).y)>0);
 assert.equal(s.screenShakeConsumedCue31211,'committed-native-cue');
});
test('combat world and overlays stay fixed while native cue consumption is retained',()=>{
 const C=context(),s=world('dist01'),settings={screenShakeV31336:true};
 const r=C.MONGSE_rareScreenShakeOffset31211(s,settings),o=C.HAPIL_currentShakeOffsetV31302(s,settings);
 assert.deepEqual([r.x,r.y,r.active,o.x,o.y,o.active],[0,0,false,0,0,false]);
 assert.equal(r.triggered,true,'the native cue receipt is retained');
 assert.equal(s.screenShakeConsumedCue31211,'committed-native-cue');
 assert.equal(s.screenShakeAttemptReadyAt31211,11);
 assert.equal(s.screenShakeReadyAt31211,12);
 assert.equal(s.screenShakeActiveUntil31211,10.2);
 assert.equal(settings.screenShakeV31336,true,'saved/user settings are not rewritten');
 assert.equal(s.time,10);assert.equal(s.hp,240);
 for(let i=0;i<120;i++){s.time=10+i/600;const a=C.MONGSE_rareScreenShakeOffset31211(s,settings),b=C.HAPIL_currentShakeOffsetV31302(s,settings);assert.deepEqual([a.x,a.y,b.x,b.y],[0,0,0,0]);}
});
test('late enemy-feel installation cannot reintroduce displacement',()=>{
 const C=context(true,true),s=world('dist01');
 assert.deepEqual(plain(C.shake(s,{screenShakeV31336:true})),{x:0,y:0});
 const a=C.MONGSE_rareScreenShakeOffset31211(s,{}),b=C.HAPIL_currentShakeOffsetV31302(s,{});
 assert.deepEqual([a.x,a.y,b.x,b.y],[0,0,0,0]);
 const before={...C,window:{__HAPIL_BATTLE_ARENA_RC138__:{enabled:()=>true}}};vm.createContext(before);vm.runInContext(oldFeel,before);
 assert(Math.hypot(before.shake(s,{}).x,before.shake(s,{}).y)>0,'old extra wrapper is a real independent shake source');
});
test('noncombat native cues and user shake accessibility settings keep their behavior',()=>{
 const C=context(),s=world('dreamRest');
 assert(Math.hypot(C.MONGSE_rareScreenShakeOffset31211(s,{}).x,C.HAPIL_currentShakeOffsetV31302(s,{}).y)>0);
 for(const settings of [{reducedFlash:true},{screenShakeV31336:false}]){
  const p=world('dist01'),a=C.MONGSE_rareScreenShakeOffset31211(p,settings),b=C.HAPIL_currentShakeOffsetV31302(p,settings);
  assert.deepEqual([a.x,a.y,b.x,b.y],[0,0,0,0]);assert.equal(p.screenShakeConsumedCue31211,undefined);
 }
});
function feedbackFixture(zone){
 let clock=1000,copies=0,sounds=0;const canvas={width:1280,height:720,getBoundingClientRect:()=>({width:1280,height:720})};
 const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='drawImage')return(...args)=>{if(args[0]===canvas)copies++;};if(key==='createRadialGradient'||key==='createLinearGradient')return()=>({addColorStop(){}});return()=>{};},set(target,key,value){target[key]=value;return true;}});
 const window={__HAPIL_BATTLE_ARENA_RC138__:{enabled:s=>s?.zone==='dist01'},__HAPIL_FEEDBACK_RC22__:{impact:()=>sounds++},matchMedia:()=>({matches:false})};
 const scope={window,performance:{now:()=>clock*1000},Date,Math,Number,Map,WeakMap,Set,setTimeout:()=>0,console};vm.createContext(scope);vm.runInContext(feedback,scope);
 const s={zone,time:100,hp:240,maxHp:240,activeHeroId:'hwando',x:13,y:24,enemies:[],timeStopUntil:0},target={id:'native-boss',boss:true,x:24,y:13,hp:400};
 const settings={hitPause:false,shake:true,screenShake:true,screenShakeV31336:true};const F=window.__HAPIL_FEEDBACK_RC128__;
 F.draw(ctx,s,canvas,settings);
 const row={epoch:1,sequence:1,kind:'OUTGOING',result:'HIT',attackerHeroId:'hwando',targetId:target.id,appliedDamage:10,hpBefore:400,hpAfter:390,source:{family:'projectile',vx:-1,vy:0}};
 assert.equal(F.record(s,target,row,{ultimate:true}),true);
 const saved=JSON.stringify(s);F.draw(ctx,s,canvas,settings);
 return{F,s,target,settings,copies:()=>copies,sounds:()=>sounds,saved,advance:()=>{clock+=.1;}};
}
test('accepted heavy feedback retains cues and sound without copying and shifting the combat canvas',()=>{
 const f=feedbackFixture('dist01');assert.equal(f.copies(),0);assert.equal(f.sounds(),1);
 const snapshot=f.F.snapshot(f.s);assert.equal(snapshot.totals.accepted,1);assert.equal(snapshot.effects,1);assert.equal(snapshot.totals.drawErrors,0);
 assert.equal(f.s.hp,240);assert.equal(f.target.hp,400);assert.equal(f.s.time,100);assert.equal(f.s.timeStopUntil,0);assert.equal(JSON.stringify(f.s),f.saved);
 assert.equal(f.settings.shake,true);assert.equal(f.settings.screenShake,true);
 f.advance();assert.equal(f.F.record(f.s,f.s,{epoch:1,sequence:2,kind:'CONTACT',targetId:'__host',result:'HIT',appliedDamage:10,hpBefore:240,hpAfter:230,source:{family:'projectile'}},{}),true);
 assert.equal(f.F.playerFlash(f.s),.58,'the actual incoming-hit flash is retained');
});
test('the original noncombat composite feedback still paints its cosmetic shake',()=>{
 const f=feedbackFixture('dreamRest');assert.equal(f.copies(),1);assert.equal(f.F.snapshot(f.s).totals.drawErrors,0);
});
test('open camera settings subscribe to effective scale changes and clean up without changing the preference',()=>{
 const code=between(bundle,'function HAPILCameraSettingsSectionRC223(){','function Gi(');
 let factor=2,effective=1.05,index=0,needsRender=false;const values=[],effects=[],listeners=new Set();
 const api={factor:()=>factor,appliedZoom:()=>effective,setFactor:v=>{factor=Math.max(1,Math.min(2,v));return factor;},subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
 const scope={window:{__HAPIL_CAMERA_RC223__:api},Math,Number,q:{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},l:{useState:initial=>{const i=index++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],value=>{const next=typeof value==='function'?value(values[i]):value;if(!Object.is(next,values[i]))needsRender=true;values[i]=next;}];},useEffect:fn=>effects.push(fn)}};
 vm.createContext(scope);vm.runInContext(code,scope);const render=()=>{index=0;needsRender=false;return JSON.stringify(scope.HAPILCameraSettingsSectionRC223());};
 assert(render().includes('105%'));assert.equal(effects.length,1);const cleanup=effects[0]();assert.equal(listeners.size,1);
 effective=1;for(const listener of listeners)listener();assert(needsRender,'effective scale rerenders even though the saved factor remains equal');assert(render().includes('100%'));assert.equal(factor,2);assert.equal(values[0],2);
 cleanup();assert.equal(listeners.size,0,'settings unmount removes its listener');
});
console.log('RC233_SCREEN_STABILITY_UNIT',JSON.stringify({status:'passed',groups,scope:'Actual native cue functions, final source/bundle wrappers, late enemy-feel and actual feedback painter; simulated clock/context, real Chrome frames are a separate gate'}));
