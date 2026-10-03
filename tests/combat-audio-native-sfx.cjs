'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');
const start=bundle.indexOf('We = (0, l.useCallback)('),end=bundle.indexOf('    MONGSE_unlockAudio =',start);
assert(start>0&&end>start);
const expression=bundle.slice(start,end).trim().replace(/^We = /,'').replace(/,$/,'');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
  const media=[],pools=new Map(),ducks=[],failed=[];let time=0,allowed=true;
  const settings={sound:true,sfxVolume:.8},prefix='./assets/combat-audio/v1/audio/';
  class Media{
    constructor(src){this.src=src;this.paused=true;this.ended=false;this.currentTime=0;this.events={};this.requests=[];media.push(this)}
    setAttribute(){}
    addEventListener(type,fn){this.events[type]=fn}
    play(){this.paused=false;const request={};request.promise=new Promise((resolve,reject)=>Object.assign(request,{resolve,reject}));this.requests.push(request);return request.promise}
    pause(){this.paused=true;this.pauses=(this.pauses||0)+1}
  }
  const controller={owns:value=>String(value).startsWith(prefix),profile:value=>String(value).startsWith(prefix)?{gain:1,cooldown:2.5,voices:1,duck:.6}:null,allowsEffects:()=>allowed,failed:value=>failed.push(value)};
  const context={window:{__HAPIL_COMBAT_AUDIO_V1__:controller},document:{hidden:false,baseURI:'https://example.test/'},URL,Audio:Media,performance:{now:()=>time*1000},Date,Map,Set,
    l:{useCallback:fn=>fn},ze:{current:settings},Fe:{current:pools},MONGSE_SFX_PROFILE:{},MONGSE_SFX:{ticking1:'tick1',ticking2:'tick2',ticking3:'tick3'},
    MONGSE_assetUrl:value=>value,MONGSE_duckBgm:(...args)=>ducks.push(args),MONGSE_bgmRef:{current:{}},HAPIL_combatAudioBridgeRef:{current:null}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'assets/combat-audio/v1/native-bridge.js'),'utf8'),context);
  const bridge=context.window.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__.create({manager:{retired:new Set()},pools,controller,applyMusic(){},clearTransition(){},stopElement(){},selectAudible(){},playEffect(){}});
  context.HAPIL_combatAudioBridgeRef.current=bridge;vm.runInContext('window.testPlay='+expression,context);
  return {play:context.window.testPlay,media,pools,ducks,failed,bridge,settings,prefix,context,allow:value=>{allowed=value},advance:seconds=>{time+=seconds}};
}

test('native uploaded gain is applied exactly once before the user setting',async()=>{
  const h=setup();h.play(h.prefix+'dark.wav',1);assert.equal(h.media.length,1);assert.equal(h.media[0].volume,.55*.8);assert.equal(h.media[0].__hapilCombatPending,true);
  h.media[0].requests[0].resolve();await flush();assert.equal(h.media[0].__hapilCombatPending,false);assert.equal(h.ducks.length,1);
});
test('actual pending uploaded clips cap admission at two independent effects',()=>{
  const h=setup();h.play(h.prefix+'one.wav',1);h.play(h.prefix+'two.wav',1);h.play(h.prefix+'three.wav',1);
  assert.equal(h.media.length,2);assert.equal(h.bridge.activeUploadedVoices(),2);
});
test('legacy clips do not consume uploaded-effect reservations',()=>{
  const h=setup();h.play('./audio/old.mp3',1);h.play(h.prefix+'one.wav',1);h.play(h.prefix+'two.wav',1);
  assert.equal(h.media.length,5);assert.equal(h.bridge.activeUploadedVoices(),2);
});
test('blocked uploaded events never allocate or play media',()=>{
  const h=setup();h.allow(false);h.play(h.prefix+'one.wav',1);assert.equal(h.media.length,0);
});
test('failed uploaded play never becomes a stale gesture-retry request',async()=>{
  const h=setup(),file=h.prefix+'one.wav';h.play(file,1);h.media[0].requests[0].reject(Error('NotAllowedError'));await flush();
  assert.equal(h.pools.get(file).pending,null);assert.equal(h.media[0].paused,true);assert.equal(h.media[0].__hapilCombatPending,false);assert.equal(h.ducks.length,0);
  h.advance(3);h.play(file,1);assert.equal(h.media[0].requests.length,2,'a later actual event may try after a gesture');
});
test('a late successful play is silenced when combat eligibility changed',async()=>{
  const h=setup();h.play(h.prefix+'one.wav',1);h.allow(false);h.media[0].requests[0].resolve();await flush();
  assert.equal(h.media[0].paused,true);assert.equal(h.media[0].__hapilCombatPending,false);assert.equal(h.ducks.length,0);
});
test('stale resolution cannot clear or pause a newer request on a reused clip',async()=>{
  const h=setup(),file=h.prefix+'one.wav';h.play(file,1);const clip=h.media[0],old=clip.requests[0];h.bridge.stopEffects();h.advance(3);h.play(file,1);const current=clip.requests[1],pauses=clip.pauses;
  old.resolve();await flush();assert.equal(clip.__hapilCombatPending,true);assert.equal(clip.paused,false);assert.equal(clip.pauses,pauses);assert.equal(h.ducks.length,0);
  current.resolve();await flush();assert.equal(clip.__hapilCombatPending,false);assert.equal(h.ducks.length,1);
});
test('uploaded media errors invalidate the native request and mark that asset failed',()=>{
  const h=setup(),file=h.prefix+'one.wav';h.play(file,1);const clip=h.media[0],token=clip.__mongseSfxRequest;clip.events.error();
  assert.equal(clip.paused,true);assert.equal(clip.__hapilCombatPending,false);assert.equal(clip.__mongseSfxRequest,token+1);assert.deepEqual(h.failed,[file]);
});
test('legacy rejected playback retains its existing retry behavior',async()=>{
  const h=setup(),file='./audio/old.mp3';h.play(file,1);h.media[0].requests[0].reject(Error('NotAllowedError'));await flush();
  assert(h.pools.get(file).pending);assert.equal(h.pools.get(file).pending.clip,h.media[0]);
});
