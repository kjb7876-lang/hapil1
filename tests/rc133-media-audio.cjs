'use strict';
// Staged transaction fixtures; no acoustic audition or natural-campaign claim.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');let clock=10000,checks=0;
const check=(value,name)=>{checks++;assert(value,name);};
const calls=[],listeners={},w={URL,console,performance:{now:()=>clock},document:{hidden:false,baseURI:'https://game.example/',addEventListener:(k,fn)=>listeners[k]=fn},addEventListener:(k,fn)=>listeners[k]=fn,matchMedia:()=>({matches:false}),__HAPIL_FEEDBACK_RC22__:{impact:()=>calls.push({type:'legacy'})}};w.window=w;
vm.createContext(w);for(const file of ['assets/combat-audio/v1/catalog.js','assets/rc133/media-catalog.js','assets/combat-audio/v1/controller.js','assets/rc133/media-audio.js','assets/rc128/combat-feedback.js','assets/combat-v31402/combat-core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),w,{filename:file});
const A=w.__HAPIL_COMBAT_AUDIO_V1__,M=w.__HAPIL_MEDIA_AUDIO_RC133__,C=w.__HAPIL_COMBAT_CORE_V31401__,F=w.__HAPIL_FEEDBACK_RC128__;
A.bind({applyMusic:(p,g)=>calls.push({type:'music',path:p.path,gain:g}),stopMusic:()=>calls.push({type:'stopMusic'}),pauseMusic:()=>calls.push({type:'pauseMusic'}),stopEffects:()=>calls.push({type:'stopEffects'}),playEffect:(p)=>calls.push({type:'effect',path:p})});
const s={zone:'cult04',hp:240,maxHp:240,time:100,x:12,y:20,activeHeroId:'gunner',enemies:[{id:'inner-evil-rc133',hp:1000,boss:true}]},ctx={phase:'game',blocked:false,clear:false,rest:false,settings:{sound:true,music:true,sfxVolume:.5,bgmVolume:.4}},source={id:1,sourceId:'inner-evil-rc133',shape:'circle',damage:20,x:12,y:20};
A.sync(s,ctx);const effects=()=>calls.filter(c=>c.type==='effect'),next=()=>{clock+=3000;s.time+=3;source.id++;};
function contact(result,reason){return C.transaction(s,s,source,'staged-native-contact',()=>{C.mark(s,s,result,reason);return false;},{damage:20});}
check(w.__HAPIL_COMBAT_AUDIO_CATALOG_V1__.version===133,'additive processed catalog');
for(const kind of ['parry','dodge','removal','innerReveal','innerAwake','innerShot','laserCharge','enemyRage','enemyHeavy'])check(Array.isArray(w.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__[kind]),'mapped admitted event '+kind);
contact('PARRY','native-parry');check(effects().length===1&&effects()[0].path.includes('/parry/'),'committed PARRY routes actual derivative');check(C.snapshot(s).events.at(-1).result==='PARRY','ledger retains native result');
const count=effects().length,row=C.snapshot(s).events.at(-1);F.record(s,s,row,source);check(effects().length===count,'duplicate ledger row silent');
next();contact('EVADE','native-perfect-evade');check(effects().at(-1).path.includes('/dodge/'),'committed EVADE routes dodge');
next();contact('REJECTED','missed-contact');check(effects().length===2,'rejected contact silent');
next();C.transaction(s,source,source,'staged-native-removal',()=>C.mark(s,source,'CANCELLED','skill'),{kind:'REMOVAL'});check(effects().at(-1).path.includes('/blink/'),'committed removal routes blink');
next();const target=s.enemies[0];C.transaction(s,target,{id:20,heroId:'gunner'},'staged-native-outgoing',()=>{target.hp-=20;C.mark(s,target,'HIT','native-damage',{appliedDamage:20});return 20;},{kind:'OUTGOING',damage:20});check(effects().at(-1).path.includes('/melee-impact/'),'applied outgoing damage routes nonvoice impact');
next();const beforeMute=effects().length;A.sync(s,{...ctx,settings:{...ctx.settings,sound:false}});contact('PARRY','native-parry');check(effects().length===beforeMute,'muted accepted event has no playback');A.sync(s,ctx);check(effects().length===beforeMute,'unmute cannot replay consumed event');
next();A.sync(s,{...ctx,blocked:true});contact('PARRY','native-parry');check(effects().length===beforeMute,'modal blocks actual event playback');A.sync(s,ctx);
next();w.document.hidden=true;listeners.visibilitychange();M.event('innerAwake',s,s,'hidden');check(effects().length===beforeMute,'hidden document blocks playback');w.document.hidden=false;listeners.visibilitychange();A.sync(s,ctx);
next();s.innerFinalRC133={phase:'reveal'};A.sync(s,ctx);check(A.diagnostics.selected==='nearSilence','actual hidden reveal selects supplied Near-Silence');s.innerFinalRC133.phase='fight';A.sync(s,ctx);check(A.diagnostics.selected==='foldingSpace','fight returns to native boss bed');
next();M.event('innerAwake',s,target,'actual-phase');check(effects().at(-1).path.includes('/awakening-phase/'),'live boss phase selects source awakening');check(A.diagnostics.activeEffects<=2,'bounded effect reservations');
const beforeDeath=effects().length;s.hp=0;A.sync(s,ctx);check(!M.event('innerAwake',s,target,'dead')&&effects().length===beforeDeath,'dead player scope cannot play');check(A.diagnostics.mode==='inactive','death disposes scope');
for(const p of Object.values(w.__HAPIL_COMBAT_AUDIO_CATALOG_V1__.effects)){check(p.voices===1,'single native voice '+p.path);check(!p.path.includes('combat_hi'),'no unauditioned voice mapped');}
const originalAudio=w.__HAPIL_COMBAT_AUDIO_V1__;
w.__HAPIL_COMBAT_AUDIO_V1__={emit:()=>{throw new Error('staged unavailable audio output');}};
check(M.event('innerAwake',s,target,'audio-fault')===false,'optional audio output failure cannot interrupt the boss transaction');
check(M.metrics().faults===1,'audio output failure remains observable');
w.__HAPIL_COMBAT_AUDIO_V1__=originalAudio;
console.log('RC133_MEDIA_AUDIO_RESULT',JSON.stringify({checks,status:'passed',scope:'staged real combat-core publication → admitted feedback → native mixer adapter, mute/modal/hidden/death and voice bounds'}));
