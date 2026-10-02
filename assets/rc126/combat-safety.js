/* RC126. Admission/geometry changes belong to simulation, never to a paint callback.
 * An asset may headline one admitted salvo per map per run; subsequent ordinary shots
 * retain their damage and travel but use the existing owner-tinted common bitmap.
 * No HP, damage, wave, victory, story, cooldown or random-number edits are made here. */
(function(root){'use strict';
 const finite=(v,d=0)=>Number.isFinite(v)?v:d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rows=v=>Array.isArray(v)?v:[],own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const stateMemory=new WeakMap(),tints=new WeakMap();let deps=null;
 const stats={volleys:0,staggered:0,zigzags:0,originalAssets:0,substitutedAssets:0,nativeBeams:0,spawnMoves:0,duplicateCosmetics:0};
 const safeZone=z=>typeof z==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(z);
 const assetKey=p=>typeof p==='string'&&p.startsWith('./assets/')&&p.length<512?p.split('?')[0]:null;
 function cleanLedger(raw){
  const out={version:1,sequence:0,zones:Object.create(null)};
  if(raw?.version!==1)return out;
  out.sequence=Number.isSafeInteger(raw.sequence)&&raw.sequence>=0?Math.min(raw.sequence,1e9):0;
  for(const zone of Object.keys(raw.zones??{}).slice(0,256)){
   if(!safeZone(zone))continue;const source=raw.zones[zone];if(!source||typeof source!=='object')continue;
   const entry=Object.create(null);for(const path of Object.keys(source).slice(0,256)){
    const key=assetKey(path),group=source[path];if(key&&typeof group==='string'&&group.length<180)entry[key]=group;
   }out.zones[zone]=entry;
  }return out;
 }
 function memory(s){let m=stateMemory.get(s);if(!m){s.rc126AssetLedger=cleanLedger(s.rc126AssetLedger);m={seen:new WeakSet(),enemies:new WeakSet(),groups:new Map(),zone:s.zone};stateMemory.set(s,m);}if(m.zone!==s.zone){m.zone=s.zone;m.groups.clear();m.enemies=new WeakSet();}return m;}
 function nextGroup(s,prefix='volley'){memory(s);return prefix+':'+(++s.rc126AssetLedger.sequence);}
 function common(){return deps?.common?.()??root.__HAPIL_DANMAKU_V31316__?.commonAsset??null;}
 function claimAsset(s,packet,path,group){
  const key=assetKey(path),fallback=common();if(!s||!safeZone(s.zone)||!key||!fallback||assetKey(fallback)===key||packet?.friendly||packet?.reflected)return path;
  memory(s);const ledger=s.rc126AssetLedger,zone=ledger.zones[s.zone]??(ledger.zones[s.zone]=Object.create(null));
  if(!own(zone,key)){if(Object.keys(zone).length>=256)return fallback;zone[key]=String(group??nextGroup(s,'asset'));stats.originalAssets++;return path;}
  if(zone[key]===String(group))return path;stats.substitutedAssets++;return fallback;
 }
 function eligible(q){return !!q&&typeof q==='object'&&finite(q.damage)>0&&[q.x,q.y,q.vx,q.vy].every(Number.isFinite)&&Math.hypot(q.vx,q.vy)>.001&&!q.friendly&&!q.reflected&&!q.heroSkillVfx&&!q.heroId31213&&!q.heroProjectileTransient&&!q.echoBoltV31368&&!q.narrativeGlyph&&!q.projectileRemovalReason31215&&!q.reachedHero31213&&!q.reachedMapBoundary31213;}
 function prepareVolley(s,a,shots,options={}){
  if(!s||!Number.isFinite(s.time))return null;const m=memory(s),list=rows(shots).filter(q=>eligible(q)&&!m.seen.has(q));if(!list.length)return null;
  const group=nextGroup(s,'salvo'),family=options.family??list.find(q=>q.rc97Grammar)?.rc97Grammar??'native';
  let lastRelease=s.time,index=0;
  for(const q of list){m.seen.add(q);q.rc126Salvo=group;q.rc127Zone=s.zone;
   // Common danmaku and ownership-sensitive echo/telekinetic deliveries retain their native path.
   if(!q.danmakuV31316){const chosen=claimAsset(s,q,q.sprite,group);if(chosen&&chosen!==q.sprite){q.rc126OriginalSprite=q.sprite;q.rc126CommonSprite=chosen;}}
   const canPace=options.rhythm===true&&q.rc95Bullet===true&&!q.danmakuV31316;
   if(canPace){
    const big=finite(q.visualScaleV31224,1)>=1.3||q.giantProjectile31219===true;
    const delay=index*(big?.17:.115),release=Math.max(s.time,finite(q.frozenUntil),finite(q.motionReleaseAt31219))+delay;
    const shift=Math.max(0,release-Math.max(s.time,finite(q.frozenUntil),finite(q.motionReleaseAt31219)));
    for(const key of ['frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[key]=Math.max(finite(q[key]),release);
    q.born=Math.max(finite(q.born,s.time),release);q.sourceBorn=q.born;
    q.hideUntilRelease31219=release>s.time;q.bodySpawned31219=true;
    if(Number.isFinite(q.expiresAt))q.expiresAt+=shift;
    if(['envy','rage','obsession'].includes(family)){
     q.rc126Zigzag={angle:Math.atan2(q.vy,q.vx),amplitude:family==='envy'?.15:.10,omega:family==='rage'?4.8:3.6,elapsed:0,side:index%2?-1:1};
     q.curve=0;q.scatterHomingPrepared31211=true;stats.zigzags++;
    }
    q.rc126ReleaseAt=release;lastRelease=Math.max(lastRelease,release);if(delay>0)stats.staggered++;index++;
   }
  }stats.volleys++;return{group,count:list.length,lastRelease,family};
 }
 function prepareFrame(s){
  if(!s||!Number.isFinite(s.time))return;const m=memory(s),groups=new Map();
  for(const q of rows(s.hostileProjectiles)){if(!eligible(q)||m.seen.has(q))continue;
   const key=String(q.sourceId??'unknown')+'|'+String(q.bossCastId31210??q.signatureKind31212??q.patternKind??'shot')+'|'+Math.round(finite(q.sourceBorn,finite(q.born,s.time))*1000);
   if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);
  }
  for(const shots of groups.values())prepareVolley(s,null,shots,{rhythm:false});
 }
 function steer(s,q,dt){
  const z=q?.rc126Zigzag;if(!z||!eligible(q)||finite(q.frozenUntil)>s.time||finite(q.motionReleaseAt31219)>s.time||finite(s.timeStopUntil)>s.time||!(dt>0))return;
  const speed=Math.hypot(q.vx,q.vy);z.elapsed+=clamp(dt,0,.28);
  // A bounded triangle wave alternates the heading, rather than curling into a knot.
  const phase=z.elapsed*z.omega,triangle=2/Math.PI*Math.asin(Math.sin(phase)),angle=z.angle+z.side*z.amplitude*triangle;
  q.vx=Math.cos(angle)*speed;q.vy=Math.sin(angle)*speed;
 }
 // RC126 finite-2 delegation: never turn a finite native hazard into an arena beam.
 function prepareNative(s,h){const ok=root.__HAPIL_FINITE_NATIVE_RC126__?.prepare(s,h)??false;if(ok)stats.nativeBeams++;return ok;}
 const protectedActor=a=>!a||a.hp<=0||a.boss||a.friendly||a.neutral||a.visualOnly||a.canonAlly||a.canonAllyV31217||a.canonicalAllyV31217||a.protectedObjective||a.objectiveStructureV31238||a.narrativeStructureV31238||a.protectedNarrativeTargetV31307||a.rc88Part||a.rc89CommandBody||a.echoChildV31368||a.cosmicLuciferV31318;
 const footprint=a=>a.boss?1.6:a.midboss?1.15:clamp(finite(a.scale,1)*.6,.45,1.1);
 function spaceFreshEnemies(s){
  if(!deps?.point||!deps?.clear||!s||s.hp<=0)return;const m=memory(s),accepted=[];
  for(const a of rows(s.enemies)){
   if(!a||typeof a!=='object'||![a.x,a.y].every(Number.isFinite))continue;
   const fresh=!m.enemies.has(a);m.enemies.add(a);
   if(fresh&&!protectedActor(a)&&finite(a.attackAt)<=s.time&&finite(a.attackStarted)<=0){
    const radius=footprint(a),conflict=p=>accepted.some(b=>b.hp>0&&Math.hypot(p.x-b.x,p.y-b.y)<radius+footprint(b)+.2);
    if(conflict(a)){
     const origin={x:a.x,y:a.y};let selected=null;
     for(const ring of [1.2,2,2.8]){for(let i=0;i<12;i++){const theta=i*Math.PI/6,p=deps.point(s,{x:origin.x+Math.cos(theta)*ring,y:origin.y+Math.sin(theta)*ring},radius);
      if(p&&[p.x,p.y].every(Number.isFinite)&&Math.hypot(p.x-s.x,p.y-s.y)>=radius+1.1&&!conflict(p)&&deps.clear(s,origin,p,radius)){selected=p;break;}}
      if(selected)break;
     }
     if(selected){a.x=selected.x;a.y=selected.y;stats.spawnMoves++;}
    }
   }accepted.push(a);
  }
 }
 function thinDuplicateCosmetics(s){
  if(!Array.isArray(s?.effects))return;const kept=[],seen=[];
  for(const e of s.effects){const cosmetic=e?.bossCastVfx===true&&!e.telegraphImpact&&!e.bossImpactTransitV31232&&!e.heroSkillVfx&&!e.spectacleCueV31317&&finite(e.size)>=3;
   if(cosmetic&&seen.some(p=>p.sprite===e.sprite&&p.sourceId===e.sourceId&&Math.abs(finite(p.born)-finite(e.born))<.12&&Math.hypot(p.x-e.x,p.y-e.y)<.3)){stats.duplicateCosmetics++;continue;}
   kept.push(e);if(cosmetic)seen.push(e);
  }if(kept.length!==s.effects.length)s.effects=kept;
 }
 function tintCommon(image,color,packet={}){
  if(root.__HAPIL_DARK_JELLY_RC127__)return root.__HAPIL_DARK_JELLY_RC127__.tint(image,color,packet);
  if(typeof document==='undefined'||!image||!/^#[0-9a-f]{6}$/i.test(color??''))return image;
  let cache=tints.get(image);if(!cache){cache=new Map();tints.set(image,cache);}if(cache.has(color))return cache.get(color);
  const c=document.createElement('canvas');c.width=image.naturalWidth||image.width;c.height=image.naturalHeight||image.height;const ctx=c.getContext('2d');if(!ctx)return image;
  ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.65;ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);
  cache.set(color,c);if(cache.size>32)cache.delete(cache.keys().next().value);return c;
 }
 function install(options){if(!options||typeof options.project!=='function')return false;deps=options;return true;}
 function snapshot(s){return{installed:!!deps,stats:{...stats},ledger:s?cleanLedger(s.rc126AssetLedger):null};}
 root.__HAPIL_COMBAT_SAFETY_RC126__=Object.freeze({version:'RC126',install,prepareNative,prepareVolley,prepareFrame,steer,spaceFreshEnemies,thinDuplicateCosmetics,claimAsset,nextGroup,cleanLedger,tintCommon,snapshot,eligible});
})(typeof window!=='undefined'?window:globalThis);
