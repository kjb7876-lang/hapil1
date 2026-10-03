/* RC130: audio presentation only. Damage, progression and native attack timing are unchanged. */
(function(root){'use strict';
 const HEROES=Object.freeze(['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']);
 // Only explicit character metadata is accepted; names and silhouettes are not gender evidence.
 const genders=Object.freeze({seoha:'female'}),voices=Object.freeze({});
 const neutralHurt='./audio/last3/PlayerMeleeHit_Part0.wav';
 const paths=Object.freeze({wood:'./audio/rc23/upload-01.wav',slash:'./audio/rc23/upload-07.wav',shot:'./audio/rc23/upload-06.wav',arcane:'./audio/rc23/upload-13.wav',heavy:'./audio/rc23/upload-15.wav',guard:'./audio/rc23/upload-02.wav',hurt:neutralHurt});
 const worlds=new WeakMap(),stats={enemyHitRequests:0,enemyHitSkipped:0,enemyHitPlayed:0,allyHurtRequests:0,allyHurtPlayed:0,awakeningPlayed:0,discarded:0,duplicateEvents:0,nativeHitSkipped:0,nativeAttackRequests:0,neutralHurtPlayed:0,voicePlayed:0};
 let installed=false,forwarding=false,lastHurtWall=-99,nativeHitWall=-99,nativeHitCount=0;
 const now=()=>root.performance?.now?.()/1000||0;
 const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 function memory(s){let m=worlds.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,queue:[],seen:new Set(),hits:0,lastEnemy:-99,lastHurt:-99,lastPlayed:-99,history:[]};worlds.set(s,m);}m.time=s.time;return m;}
 function identity(s,a,row={}){const hero=String(row.heroId||a?.heroId||a?.activeHeroId||(a===s?s.activeHeroId:'')||'');const explicit=a?.gender??a?.sex;const gender=explicit==='female'||explicit==='male'?explicit:genders[hero]||'unspecified';return{hero,gender,voice:voices[hero]||null};}
 function enqueue(s,event){const m=memory(s);if(m.queue.length>=8){const i=m.queue.findIndex(e=>e.priority<event.priority);if(i<0){stats.discarded++;return false;}m.queue.splice(i,1);}m.queue.push({...event,at:finite(s.time)});return true;}
 function enemyHit(s,target,damage,source){
  if(!s||!(damage>0)||!source||source.partySlotV31322||source.heroId!==s.activeHeroId)return false;
  root.__HAPIL_CONTACT_RC23__?.mark(s,target,damage,source);stats.enemyHitRequests++;
  const m=memory(s);m.hits++;if(m.hits%6!==0||now()-m.lastEnemy<1.2){stats.enemyHitSkipped++;return false;}
  const h=source.heroId,key=h==='hwando'?'wood':h==='slayer'?'slash':h==='hunter'||h==='gunner'?'shot':'arcane';
  if(m.queue.some(e=>e.kind==='enemy-hit'))return false;
  return enqueue(s,{kind:'enemy-hit',key,path:paths[key],priority:1,gain:.14});
 }
 function contact(s,a,row,source){
  if(!s||!a||row?.kind!=='CONTACT'||!['HIT','DOWNED'].includes(row.result)||!(Math.max(finite(row.appliedDamage),finite(row.hpLoss))>0))return false;
  const who=identity(s,a,row);if(!HEROES.includes(who.hero))return false;
  const m=memory(s),key=String(row.epoch)+':'+String(row.sequence)+':'+String(row.targetId);
  if(m.seen.has(key)){stats.duplicateEvents++;return false;}m.seen.add(key);if(m.seen.size>128)m.seen.delete(m.seen.values().next().value);
  stats.allyHurtRequests++;
  // No unverified male/female vocal clips: the fallback is a physical impact, never a pitched voice.
  const voice=who.voice?.verified===true&&who.voice.gender===who.gender?who.voice:null;
  return enqueue(s,{kind:'ally-hurt',key:'hurt',path:voice?.path||neutralHurt,priority:9,gain:.48,hero:who.hero,gender:who.gender,vocal:!!voice});
 }
 function impact(s,e){
  // RC128 also asks for a sound after every hit. The authoritative paths above own those sounds.
  if(!s||!e||finite(e.priority)<7)return false;
  return enqueue(s,{kind:'awakening',key:'heavy',path:paths.heavy,priority:7,gain:.3});
 }
 function tick(s,settings,play,unlocked){
  if(!s||typeof play!=='function')return;const m=memory(s),t=now();
  const fresh=m.queue.filter(e=>finite(s.time)-e.at>=0&&finite(s.time)-e.at<.22);m.queue=[];
  if(!unlocked||settings?.sound===false||finite(settings?.sfxVolume??settings?.volume,1)<=0||root.document?.hidden||s.paused||s.pause||s.hp<=0){stats.discarded+=fresh.length;return;}
  fresh.sort((a,b)=>b.priority-a.priority);
  const e=fresh.find(e=>e.kind==='ally-hurt'?t-m.lastHurt>=.22:e.kind==='enemy-hit'?t-m.lastEnemy>=1.2&&t-m.lastHurt>=.5:t-m.lastPlayed>=.3);
  if(!e){stats.discarded+=fresh.length;return;}
  if(e.kind==='enemy-hit'&&t-m.lastPlayed<.16){stats.discarded++;return;}
  if(e.kind==='ally-hurt'){m.lastHurt=t;lastHurtWall=t;stats.allyHurtPlayed++;stats[e.vocal?'voicePlayed':'neutralHurtPlayed']++;}
  if(e.kind==='enemy-hit'){m.lastEnemy=t;stats.enemyHitPlayed++;}
  if(e.kind==='awakening')stats.awakeningPlayed++;
  m.lastPlayed=t;forwarding=true;try{play(e.path,e.gain,e.kind==='ally-hurt'?.16:.12);}finally{forwarding=false;}
  m.history.push({kind:e.kind,hero:e.hero??null,gender:e.gender??null,vocal:e.vocal===true,path:e.path,at:t});if(m.history.length>24)m.history.shift();
 }
 function permitNative(path){
  if(forwarding)return true;const p=String(path),t=now();
  if(/wood-hit-|sword-flash|sword[24]\.mp3|arrow1\.mp3|LaserGun\.wav/i.test(p)){stats.nativeAttackRequests++;return true;}
  if(/PlayerMeleeHit_Part0\.wav/.test(p)){nativeHitCount++;if(nativeHitCount%6||t-nativeHitWall<1.2||t-lastHurtWall<.5){stats.nativeHitSkipped++;return false;}nativeHitWall=t;}
  return true;
 }
 function nativeGain(path){if(forwarding)return 1;return now()-lastHurtWall<.2?.45:1;}
 function snapshot(s){const m=s&&worlds.get(s);return{version:'RC130',installed,stats:{...stats},queue:m?.queue.length||0,history:m?m.history.slice():[],verifiedGenders:{...genders},verifiedVocalVoices:0,neutralHurt};}
 function install(){
  const A=root.__HAPIL_FEEDBACK_RC22__,F=root.__HAPIL_FEEDBACK_RC128__;if(!A||!F)return false;
  if(!A.rc130){const descriptors=Object.getOwnPropertyDescriptors(A);for(const [k,value]of Object.entries({hit:enemyHit,impact,tick,rc130:true,metrics:()=>snapshot().stats})){descriptors[k]={value,enumerable:true,configurable:false,writable:false};}root.__HAPIL_FEEDBACK_RC22__=Object.freeze(Object.defineProperties({},descriptors));}
  if(!F.rc130){const descriptors=Object.getOwnPropertyDescriptors(F),old=F.record;descriptors.record={value:function(s,a,row,source){contact(s,a,row,source);return old.call(this,s,a,row,source);},enumerable:true};descriptors.rc130={value:true,enumerable:true};root.__HAPIL_FEEDBACK_RC128__=Object.freeze(Object.defineProperties({},descriptors));}
  installed=true;return true;
 }
 const api=Object.freeze({version:'RC130',identity,enemyHit,contact,impact,tick,permitNative,nativeGain,snapshot,install});root.__HAPIL_AUDIO_RC130__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root.document){let tries=0;(function ready(){if(!install()&&++tries<1200)root.setTimeout(ready,20);})();}
})(typeof window!=='undefined'?window:globalThis);
