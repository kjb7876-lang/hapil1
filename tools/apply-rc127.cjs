'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
function edit(file,fn){const old=fs.readFileSync(file,'utf8'),next=fn(old);fs.writeFileSync(file,next);console.log('RC127_EDIT',file,old.length,next.length);}
function one(s,from,to,label){assert.equal(s.split(from).length-1,1,'exact single anchor: '+label);return s.replace(from,to);}
const bundle='assets/index-v31526.js';
if(fs.readFileSync(bundle,'utf8').includes('/* RC127_RUNTIME_INSTALLED */')){console.log('RC127 integration already present');process.exit(0);}
edit(bundle,s=>{
 const speed=`4.75 * (window.__HAPIL_STORY_RC51__?.heroSpeed(o) ?? 1) *
                (1 + (R.current.speed ?? 0) * 0.07) *
                r.speedMultiplier *
                MONGSE_infiniteBaseStats.speedMultiplier *
                u *
                (c ? s.speedMultiplier : 1) *
                (o.timeAccelerationUntil > o.time
                  ? i.accelerationMultiplier
                  : 1)`;
 s=one(s,speed,`window.__HAPIL_POLICY_RC127__.speed(o,R.current,{mastery:r.level,awakened:c,awakeningMultiplier:s.speedMultiplier,accelerated:o.timeAccelerationUntil>o.time,accelerationMultiplier:i.accelerationMultiplier})`,'single ordinary movement speed');
 s=one(s,'* (window.__HAPIL_DAMAGE_RC108__?.incoming(e,MONGSE_damageSource)??1),','* (window.__HAPIL_DAMAGE_RC108__?.incoming(e,MONGSE_damageSource)??1) * (window.__HAPIL_POLICY_RC127__?.incoming(e,MONGSE_damageSource)??1),','final incoming factor');
 s=one(s,'detail: `이동 속도 ×${MONGSE_infiniteProfile.speedMultiplier.toFixed(3)}`','detail: `피격 피해 감소 +${(Math.min(.4,MONGSE_infiniteProfile.speedMultiplier-1)*100).toFixed(1)}% · 이동 속도 고정`','infinite speed UI');
 s=one(s,'? `이동 속도 +7%`','? `피격 피해 감소 +7% · 이동 속도 고정`','basic speed UI');
 // The native caster is wrapped at its final dispatch boundary below; active packet times stay native.
 function block(startToken,apiToken,fn){const start=s.indexOf(startToken),api=s.indexOf(apiToken,start),end=s.indexOf('\n})();',api)+6;assert(start>=0&&api>start&&end>api,'module boundaries '+apiToken);s=s.slice(0,start)+fn(s.slice(start,end))+s.slice(end);}
 block('/* HAPIL_V31316_DANMAKU_PATCH','window.__HAPIL_DANMAKU_V31316__=',b=>{
  b=one(b,'function trySchedule(',`function trySchedule(s,a,...args){const p=window.__HAPIL_POLICY_RC127__;return p?p.schedule(s,a,()=>tryScheduleBaseRC127(s,a,...args),'danmaku'):tryScheduleBaseRC127(s,a,...args);}\n  function tryScheduleBaseRC127(`,'danmaku admission transaction');
  b=one(b,'const cancelled=!eligible(s,a)||phase(a)!==run.phase||run.zone!==s.zone||suppress(s);','const cancelled=!s||!a||num(s.hp)<=0||num(a.hp)<=0||!s.enemies?.includes(a)||run.zone!==s.zone;','committed danmaku survives phase change');
  b=one(b,'const dialogue=MONGSE_isEncounterLocked31226(s),stopped=num(s.timeStopUntil)>now,paused=dialogue||stopped;','const dialogue=MONGSE_isEncounterLocked31226(s)||suppress(s),stopped=num(s.timeStopUntil)>now,paused=dialogue||stopped;','suppression pauses rather than deletes committed volley');
  b=one(b,'function tintShot(image,color){',`function tintShot(image,color,q={}){\n    if(q.danmakuArtV31316===COMMON_BULLET&&window.__HAPIL_DARK_JELLY_RC127__)return window.__HAPIL_DARK_JELLY_RC127__.tint(image,color,q);`,'jelly material in authored danmaku renderer');
  b=one(b,'tintShot(im,q.danmakuColorV31316??q.color)','tintShot(im,q.danmakuColorV31316??q.color,q)','owner/map tint context');
  return b;
 });
 block('const VERSION="3.13.18",ZONE="ep1a11",BASE=','window.__HAPIL_ARSENAL_V31318__=',b=>{
  b=one(b,'function trySchedule(',`function trySchedule(s,a,...args){const p=window.__HAPIL_POLICY_RC127__;return p?p.schedule(s,a,()=>tryScheduleBaseRC127(s,a,...args),'cosmic-lucifer'):tryScheduleBaseRC127(s,a,...args);}\n  function tryScheduleBaseRC127(`,'cosmic admission transaction');
  b=one(b,'if(flow?.enabled(s)){forcedMode=','if(!forcedMode&&flow?.enabled(s)){forcedMode=','honor explicit cosmic action');
  b=one(b,'live.set(s,run);','live.set(s,run);window.__HAPIL_SKILL_COMPLETION_V31412__?.beginEnemyCast(s,a,run.phase,last+.35);','register cosmic committed ownership');
  b=one(b,'dialogue=MONGSE_isEncounterLocked31226(s),stopped=','dialogue=MONGSE_isEncounterLocked31226(s)||suppressed(s),stopped=','cosmic suppression pause');
  b=one(b,'const delta=Math.max(0,latest-r.last);r.last=latest;',`const delta=Math.max(0,latest-r.last);if(delta>0)for(const key of ['cosmicArsenalReadyAtV31318','readyAt','recoverUntil','themedOrdnanceAt','bossCombatPatternReadyAtV31230'])if(num(r.actor[key])>num(s.time))r.actor[key]+=delta;r.last=latest;`,'keep admission clocks aligned after actual delivery delay');
  b=one(b,'r.cue.duration=Math.max(.1,latest-r.cue.born+.13);',`r.cue.duration=Math.max(.1,latest-r.cue.born+.13);\n    for(const packet of [...current,...r.hits,...r.shots]){packet.bossCastResolveAt31210=Math.max(num(packet.bossCastResolveAt31210),latest+r.recovery);packet.interruptProtectedUntil31210=Math.max(num(packet.interruptProtectedUntil31210),latest+r.recovery);}\n    window.__HAPIL_SKILL_COMPLETION_V31412__?.beginEnemyCast(s,r.actor,r.phase,latest+.35);`,'retain packet protection through final delayed impact');
  return b;
 });
 s=one(s,'if (!e || e.activePattern) return !1;','if (!e || e.activePattern || window.__HAPIL_SKILL_COMPLETION_V31412__?.blockReset(e)) return !1;','normal dodge cannot cancel committed special');
 s+=`\n/* RC127_RUNTIME_INSTALLED */\n(()=>{'use strict';\n window.__HAPIL_DARK_JELLY_RC127__?.install({maps:N});\n function install(attempt=0){if(!window.__HAPIL_RC95_NATIVE__){if(attempt<1200)setTimeout(()=>install(attempt+1),10);return;}\n const P=window.__HAPIL_POLICY_RC127__;if(!P)return;\n const cast=Ei;Ei=function(s,a,...args){return P.schedule(s,a,()=>cast(s,a,...args),'native-skill');};\n const rift=MONGSE_beginSpatialRiftBarrage;MONGSE_beginSpatialRiftBarrage=function(s,a,...args){return P.schedule(s,a,()=>rift(s,a,...args),'spatial-rift');};\n const spawn=MONGSE_spawnBossCombatPatternV31230;MONGSE_spawnBossCombatPatternV31230=function(s,a,...args){return P.schedule(s,a,()=>spawn(s,a,...args),'boss-pattern');};\n const theme=MONGSE_spawnThemeOrdnanceKind3129;MONGSE_spawnThemeOrdnanceKind3129=function(s,a,...args){return P.schedule(s,a,()=>theme(s,a,...args),'theme-ordnance');};\n window.__HAPIL_RC127_INSTALLED__=true;\n }install();\n})();\n`;
 return s;
});
edit('assets/rc126/combat-safety.js',s=>{
 s=one(s,'function tintCommon(image,color){',`function tintCommon(image,color,packet={}){\n  if(root.__HAPIL_DARK_JELLY_RC127__)return root.__HAPIL_DARK_JELLY_RC127__.tint(image,color,packet);`,'shared common tint');
 return one(s,'m.seen.add(q);q.rc126Salvo=group;','m.seen.add(q);q.rc126Salvo=group;q.rc127Zone=s.zone;','map identity on simulation admission');
});
edit('assets/combat-v31402/projectile-pipeline.js',s=>one(s,'p.rc126CommonSprite&&selected.path===p.rc126CommonSprite?(root.__HAPIL_COMBAT_SAFETY_RC126__?.tintCommon(selected.image,p.color)??selected.image):selected.image',`selected.path.split('?')[0].endsWith('/danmaku-jellybean.webp')?(root.__HAPIL_COMBAT_SAFETY_RC126__?.tintCommon(selected.image,p.danmakuColorV31316??p.color,p)??selected.image):selected.image`,'all common bitmap paths receive material, special art unchanged'));
edit('assets/combat-v31412/skill-completion.js',s=>{
 s=one(s,"['narrativeCasts','telekineticCasts','spatialRiftCasts','bossUltimateCastsV31334','cosmicCastsV31318']","['narrativeCasts','telekineticCasts','spatialRiftCasts','bossUltimateCastsV31334','cosmicCastsV31318','bossLaserCastsV31330','pendingHits','impactQueue','hostileProjectiles']",'all committed delivery collections');
 s=one(s,'if(idOf(cast)!==actorId)continue;',"if(String(cast?.sourceId??cast?.ownerId??cast?.ownerIdV31331??'')!==actorId||cast?.damageSuppressedV31226||cast?.projectileRemovalReason31215)continue;",'cast owner is not cast id');
 s=one(s,'accept(Math.max(finite(cast.endAt),finite(cast.end),finite(cast.fireAt)+finite(cast.activeSeconds)));','accept(Math.max(finite(cast.endAt),finite(cast.end),finite(cast.at),finite(cast.impactAt),finite(cast.motionReleaseAt31219),finite(cast.interruptProtectedUntil31210),finite(cast.fireAt)+finite(cast.activeSeconds)));','actual delayed delivery deadlines');
 return s;
});
edit('assets/rc95/combat-flow.js',s=>{
 s=one(s,'f.nextLaser=c.endAt+.35;','f.nextLaser=c.endAt+(root.__HAPIL_POLICY_RC127__?.interval(s,a,.35)??.35);','story laser admission only');
 s=one(s,'f.nextBullet=Math.max(s.time+(mixed?1.25:.72),(paced?.lastRelease??s.time)+.16);','f.nextBullet=root.__HAPIL_POLICY_RC127__?.deadline(s,a,Math.max(s.time+(mixed?1.25:.72),(paced?.lastRelease??s.time)+.16))??Math.max(s.time+(mixed?1.25:.72),(paced?.lastRelease??s.time)+.16);','story bullet admission only');
 return s;
});
edit('index.html',s=>{
 s=one(s,'<script src="./assets/rc126/finite-native.js?v=42602"></script>',`<script src="./assets/rc127/combat-policy.js?v=42701"></script>\n    <script src="./assets/rc127/dark-jelly.js?v=42701"></script>\n    <script src="./assets/rc126/finite-native.js?v=42602"></script>`,'new modules before consumers');
 for(const p of ['assets/index-v31526.js','assets/rc126/combat-safety.js','assets/combat-v31402/projectile-pipeline.js','assets/combat-v31412/skill-completion.js','assets/rc95/combat-flow.js']){const re=new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\?v=\\d+','g');assert.equal([...s.matchAll(re)].length,1,'cache reference '+p);s=s.replace(re,p+'?v=42701');}
 return s;
});
console.log('RC127 exact integration complete; no voice/story files or laser geometry changed.');
