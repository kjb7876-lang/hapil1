/* RC137: authored owner identity and simulation-owned large-projectile admission.
 * Shared sprite sheets use distinct inspected source rectangles, never recolours.
 * Native damage/contact, travel paths, lasers and the RC130 viewport cap remain owned
 * by their existing reducers. Only admission/release clocks move together here. */
(function(root){'use strict';
 const data=root.__HAPIL_BOSS_ART_DATA_RC137__,finite=(x,d=0)=>Number.isFinite(x)?x:d;
 const policy=Object.freeze({bodyRatio:1.1,minimumInterval:.24,maximumActive:3,spawnPadding:8,retryInterval:.05});
 const pictures=new Map(),runs=new WeakMap();let deps=null,packet=null,ready=false;
 const stats={routed:0,measured:0,large:0,delayed:0,overlapHolds:0,capHolds:0,missing:0};
 const clean=p=>String(p??'').split(/[?#]/)[0],source='./'+data.source.path;
 const removed=q=>q?.cancelled||q?.parriedV31356||q?.projectileRemovalReason31215||q?.reachedHero31213||q?.reachedMapBoundary31213||q?.friendly||q?.reflected;
 function actor(s,q){return (s?.enemies??[]).find(a=>a.id===q?.sourceId||a.id===q?.ownershipSourceIdV31322);}
 function owner(s,q){const a=actor(s,q),id=a?.rc135FissionIdentity??a?.rc133TemplateId??a?.combatOwnerIdRC69??q?.rc137Owner??q?.themeOwnerV31323??q?.sourceId;return data.owners[id]?id:null;}
 function withPacket(q,fn){const old=packet;packet=q;try{return fn();}finally{packet=old;}}
 function picture(path,s){if(clean(path)!==source)return null;const id=owner(s,packet);return pictures.get(id)??null;}
 function route(s,q){
  if(!ready||!q||removed(q)||q.rc133InnerShot||q.echoBoltV31368||q.heroSkillVfx||q.heroProjectileTransient||q.heroId31213||q.danmakuV31316||q.rc126CommonSprite||root.__HAPIL_PRESENTATION_RC130__?.hazard(q))return;
  const id=owner(s,q),entry=data.owners[id];if(!entry)return;
  // Preserve common jellybean shots; same-owner repeats and fission copies may
  // keep their owner frame. Every other travelling boss bitmap is exclusive.
  const common=root.__HAPIL_DANMAKU_V31316__?.commonAsset;if(clean(q.sprite)===clean(common))return;
  q.rc137Owner=id;q.sprite=q.fallbackSprite=entry.sprite;q.rc137SourceRect=entry.frame??null;for(const h of s?.pendingHits??[])if(q.id!=null&&h.rc137ProjectileId===q.id&&h.sourceId===q.sourceId){h.telekineticSprite=entry.sprite;h.rc137Owner=id;h.rc137SourceRect=entry.frame??null;}stats.routed++;
 }
 const release=q=>Math.max(finite(q.frozenUntil),finite(q.motionReleaseAt31219),finite(q.collisionDisabledUntil31219),finite(q.collisionDisabledUntilV31226),finite(q.telegraphUntil31210),finite(q.born));
 function shift(q,to,s){
  const old=release(q),delta=Math.max(0,to-old);if(!delta)return;
  for(const k of ['frozenUntil','telegraphUntil31210','motionReleaseAt31219','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[k]=Math.max(finite(q[k]),to);
  q.born=finite(q.born,old)+delta;q.sourceBorn=finite(q.sourceBorn,old)+delta;
  if(Number.isFinite(q.expiresAt))q.expiresAt+=delta;
  for(const k of ['pauseUntil31212','orbitUntil31212','retargetAt31212','returnAt','returnUntil','homeAt31211','homeUntil31211','bossCastResolveAt31210','interruptProtectedUntil31210','nominalExpiresAt31213','hardExpiresAt31213','hardExpiresAt31214','projectileEgressStartedAt31215','projectileEgressHardAt31215','bossRhythmHoldUntil31214','bossRhythmReleaseAt31214','rc137ExpiresAt'])if(Number.isFinite(q[k])&&q[k]>=old)q[k]+=delta;
  for(const h of s?.pendingHits??[])if(q.id!=null&&h.rc137ProjectileId===q.id&&h.sourceId===q.sourceId){for(const k of ['born','at','impactAt','expiresAt','telegraphUntil31210'])if(Number.isFinite(h[k]))h[k]+=delta;h.rc137ReleaseAt=to;}
  q.hideUntilRelease31219=true;q.bodySpawned31219=true;q.rc137ReleaseAt=to;stats.delayed++;
 }
 function preview(s,q){
  const copy={...q,born:s.time,sourceBorn:s.time,frozenUntil:s.time,telegraphUntil31210:s.time,motionReleaseAt31219:s.time,collisionDisabledUntil31219:s.time,collisionDisabledUntilV31226:s.time,hideUntilRelease31219:false,bodySpawned31219:true};
  return deps.bitmap.projectile(s,copy)?.displayBounds??null;
 }
 const overlap=(a,b)=>a&&b&&a.left<b.right+policy.spawnPadding&&a.right>b.left-policy.spawnPadding&&a.top<b.bottom+policy.spawnPadding&&a.bottom>b.top-policy.spawnPadding;
 function memory(s){let m=runs.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,lastEmission:-Infinity,seen:new WeakSet()};runs.set(s,m);}m.time=s.time;return m;}
 function pace(s){
  if(!deps||!s||s.hp<=0||deps.locked?.(s)||s.paused||s.pause||finite(s.timeStopUntil)>s.time)return;
  const party=root.__HAPIL_PARTY_V31322__;if(party?.state===s&&(party.status?.role==='guest'||party.status?.paused||party.status?.disconnected))return;
  const m=memory(s),list=s.hostileProjectiles??[],R=root.__HAPIL_COMBAT_SAFETY_RC126__;
  for(const q of list){
   if(!R.eligible(q)||removed(q)||root.__HAPIL_PRESENTATION_RC130__?.hazard(q))continue;
   const a=actor(s,q);if(!q.rc137SizeEvidence&&(!a||!(a.boss||a.midboss)||a.rc133InnerBoss))continue;
   if(!m.seen.has(q)){
    const shape=preview(s,q),body=deps.bitmap.body(s,a,false)?.displayBounds;
    if(!shape||!body){stats.missing++;shift(q,Math.max(release(q),s.time+policy.retryInterval),s);continue;}
    m.seen.add(q);stats.measured++;q.rc137SizeEvidence={projectile:shape.longEdge,body:body.longEdge,ratio:shape.longEdge/Math.max(.001,body.longEdge),reference:'CSS alpha bounds; authoritative humanoid foreground, Stand auxiliary excluded; RC130 cap applied'};
    if(shape.longEdge>body.longEdge*policy.bodyRatio){q.rc137Large=true;stats.large++;}
   }
   if(!q.rc137Large||q.rc137Emitted||release(q)>s.time)continue;
   const active=list.filter(p=>p!==q&&p.rc137Large&&p.rc137Emitted&&!removed(p));
   const shape=preview(s,q),conflict=active.some(p=>overlap(shape,deps.bitmap.projectile(s,p)?.displayBounds));
   const interval=m.lastEmission+policy.minimumInterval;
   if(active.length>=policy.maximumActive||conflict||s.time+1e-8<interval){if(conflict)stats.overlapHolds++;if(active.length>=policy.maximumActive)stats.capHolds++;shift(q,Math.max(s.time+policy.retryInterval,interval),s);continue;}
   q.rc137Emitted=true;q.rc137EmittedAt=s.time;m.lastEmission=s.time;
  }
 }
 function prepare(s){for(const q of s?.hostileProjectiles??[])route(s,q);pace(s);}
 function install(input){
  if(deps)return true;deps=input;
  for(const row of root.__HAPIL_THEME_V31323__.catalog.owners){const own=data.owners[row.id];if(own&&!row.assets.includes(own.sprite))row.assets.push(own.sprite);}
  // The ordnance renderer keeps its own mutable route snapshot. Register the
  // same owner path there so repair/queueing cannot restore an old recolour.
  for(const row of root.__HAPIL_ORDNANCE_V31322__?.rows()??[]){const own=data.owners[row.id];if(own&&!row.assets.includes(own.sprite))row.assets.push(own.sprite);}
  for(const [id,w]of Object.entries({...data.independentBodies,'mb-ep1b06b':{...data.winter,zone:'ep1b06b'}})){const a=input.maps[w.zone]?.enemies?.find(a=>a.id===id);if(a){a.sprite=w.path;a.phaseSprites=null;a.phaseSpriteFallbacks=null;a.actionSprites={idle:a.sprite,move:a.sprite,windup:a.sprite,attackA:a.sprite,attackB:a.sprite,hit:a.sprite,stagger:a.sprite,death:a.sprite};a.actionSpritesByPhase=null;}}
  const R=root.__HAPIL_COMBAT_SAFETY_RC126__;root.__HAPIL_COMBAT_SAFETY_RC126__=Object.freeze({...R,prepareFrame(s){for(const q of s?.hostileProjectiles??[])route(s,q);R.prepareFrame(s);pace(s);}});
  return true;
 }
 async function load(){
  const image=new Image();image.src=source;await image.decode();
  // Runtime atlas extraction, source PNG is never altered. Cache small native
  // Images so the existing bitmap pipeline and alpha contact recorder agree.
  await Promise.all(data.cells.map(async cell=>{const [x,y,w,h]=cell.rect,c=document.createElement('canvas'),scale=Math.min(1,160/Math.max(w,h));c.width=Math.ceil(w*scale);c.height=Math.ceil(h*scale);c.getContext('2d').drawImage(image,x,y,w,h,0,0,c.width,c.height);const im=new Image();im.src=c.toDataURL('image/png');await im.decode();pictures.set(cell.owner,im);}));
  image.src='';ready=true;
 }
 root.__HAPIL_BOSS_ART_RC137__=Object.freeze({install,prepare,pace,route,owner,withPacket,picture,preview,shift,release,overlap,policy,data,get ready(){return ready;},metrics:()=>({...stats}),frame:id=>data.owners[id]});
 load().catch(e=>{root.__HAPIL_BOSS_ART_RC137_ERROR__=String(e);});
})(window);
