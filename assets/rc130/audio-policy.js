/* RC130: deterministic audio priorities. Uploaded ZIP bytes were not accessible
 * in this session; no unreviewed voice or claimed new audio asset is installed.
 * Existing hero-attack routing and the narration mixer remain authoritative.
 */
(function(root){
 'use strict';
 const records=new WeakMap(),stats={enemyHitRequests:0,enemyHitAccepted:0,neutralHurt:0,verifiedHurt:0};
 const neutral={hurt:'./audio/v31361/contact-kinetic.wav',heavy:'./audio/v31361/contact-heavy.wav'};
 const local=p=>typeof p==='string'&&/^\.\/audio\/[\w./-]+\.(?:wav|mp3|ogg|m4a)$/i.test(p)&&!p.includes('..');
 function state(s){let m=records.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,serial:0,lastHit:-99};records.set(s,m);}m.time=s.time;return m;}
 function enemyHit(s){
  if(!s||typeof s!=='object')return false;
  const m=state(s);stats.enemyHitRequests++;m.serial++;
  if(m.serial%6!==1||s.time-m.lastHit<1.1)return false;
  m.lastHit=s.time;stats.enemyHitAccepted++;return true;
 }
 function route(s,event,fallback){
  if(event?.channel!=='ally-hurt')return fallback;
  const hero=Object.prototype.hasOwnProperty.call(event,'heroId')?event.heroId:s?.activeHeroId,pack=root.__HAPIL_AUDIO_RC130_MANIFEST__,identity=pack?.heroIdentity?.[hero],voice=pack?.hurtByHero?.[hero];
  // Both the character identity AND the exact voice assignment need review.
  // Unknown characters never borrow a male/female voice from the active hero.
  if(hero&&identity?.reviewed===true&&voice?.reviewed===true&&voice.heroId===hero&&voice.gender===identity.gender&&['male','female','nonvocal'].includes(voice.gender)&&local(voice.path)){
   stats.verifiedHurt++;return voice.path;
  }
  stats.neutralHurt++;return event.key==='heavy'?neutral.heavy:neutral.hurt;
 }
 function attack(hero,action,fallback){const row=root.__HAPIL_AUDIO_RC130_MANIFEST__?.attackByHero?.[hero]?.[String(action||'A').toUpperCase()];return row?.reviewed===true&&local(row.path)?row.path:fallback;}
 function snapshot(){return{version:'RC130',...stats,enemyHitEvery:6,enemyHitMinimumInterval:1.1,unreviewedVoicesDisabled:true,uploadedArchiveImported:false};}
 const api=Object.freeze({version:'RC130',neutral,enemyHit,route,attack,snapshot});root.__HAPIL_AUDIO_RC130__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
