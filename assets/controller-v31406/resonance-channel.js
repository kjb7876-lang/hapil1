/* HAPIL 3.14.06: authoritative held-D reducer, relocated from the native bundle.
 * Resource arithmetic and contact/visual ordering are preserved; host input scopes
 * and transaction tokens prevent stale releases from ending a new session. */
(function(root){'use strict';let started=false;
 function install(native){if(started)return root.__HAPIL_CHANNEL_V31364__;
  if(!Object.getOwnPropertyDescriptor(native,"F")?.get)throw new TypeError("Missing live channel getter F");
  if(!Object.getOwnPropertyDescriptor(native,"HAPIL_effectiveGrowthV31400")?.get)throw new TypeError("Missing live channel getter HAPIL_effectiveGrowthV31400");
  if(!Object.getOwnPropertyDescriptor(native,"HAPIL_projectileVisibleV31355")?.get)throw new TypeError("Missing live channel getter HAPIL_projectileVisibleV31355");
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_isEncounterLocked31226")?.get)throw new TypeError("Missing live channel getter MONGSE_isEncounterLocked31226");
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_recordProjectileRemoval31215")?.get)throw new TypeError("Missing live channel getter MONGSE_recordProjectileRemoval31215");
  if(!Object.getOwnPropertyDescriptor(native,"hi")?.get)throw new TypeError("Missing live channel getter hi");
  if(!Object.getOwnPropertyDescriptor(native,"sr")?.get)throw new TypeError("Missing live channel getter sr");
  if(!root.__HAPIL_ACTION_CONTRACT_V31406__)throw new Error("Action contract not loaded");
/* v31364: one authoritative held-D state machine. No duration cap or render-time healing.
 * Existing D renderer alias is retained, but the old one-second controller is replaced.
 * WeakMap transactions never survive a save, world replacement, hero swap or clock reset.
 */
(()=>{'use strict';
 const num=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
 const config=Object.freeze({blinkCooldown:0,guardCooldown:0,guardSeconds:null,resonanceCost:0,
  healPerSecond:2,resonancePerContact:12,heavyResonancePerContact:20,healPerContact:3,heavyHealPerContact:7,continuousContactInterval:.35,
  awakeningReductionPerProjectile:1,maxAwakeningReductionPerCast:5,maxContactRecords:256,
  minimumAwakeningLevel:1,minimumAwakeningSeconds:7.2,conversionGraceSeconds:.12});
 const sessions=new WeakMap(),latched=new WeakSet(),pointerIds=new Set();let currentWorld=null;
 const Action=window.__HAPIL_ACTION_CONTRACT_V31406__;
 const stats={casts:0,contacts:0,duplicates:0,healed:0,conversions:0,ended:0};
 const party=()=>window.__HAPIL_PARTY_V31322__,controls=()=>window.__HAPIL_CONTROLS_V31329__;
 const heroId=(s,a)=>String(a===s?s?.activeHeroId:a?.heroId??'');
 function authority(s){const p=party();return !!s&&Number.isFinite(s.time)&&!(p?.state===s&&(p.status.role==='guest'||p.status.disconnected||p.status.paused));}
 function blocked(s){const b=controls()?.binding;return !!(b?.state?.current===s&&(b.phase!=='game'||b.modal?.current||b.blocked?.()||document.hidden||window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()||window.__HAPIL_READING_V31342__?.blocked));}
 function end(s,a=s,reason='release',expectedToken){
  const m=a&&sessions.get(a);if(!m||!Action.matchesToken(m.token,expectedToken))return false;sessions.delete(a);a.channelDActiveV31364=false;
  a.cooldowns??={};a.cooldowns.D=Math.max(num(a.cooldowns.D),num(s?.time)+config.guardCooldown);
  if(a.heroMotion?.channelDActiveV31364)a.heroMotion={...a.heroMotion,kind:'idle',until:num(s?.time),dx:0,dy:0,channelDActiveV31364:false};
  a.moveVx=a.moveVy=0;stats.ended++;if(reason==='release'&&num(a.resonance)>=100)convert(s,a);return true;
 }
 function session(s,a=s){const m=a&&sessions.get(a);if(!m)return null;
  if(m.world!==s||m.zone!==s.zone||m.hero!==heroId(s,a)||s.time<m.start||(m.inputScope&&!Action.current(m.inputScope,controls()?.binding,true))){end(s,a,'context');return null;}return m;
 }
 function active(s,a=s){return !!session(s,a)&&num(a?.hp)>0&&authority(s)&&!blocked(s);}
 function clear(s=currentWorld){pointerIds.clear();if(!s)return;
  for(const a of [s,...(party()?.state===s?party().actors:[])]){end(s,a,'clear');latched.delete(a);}
 }
 function held(s){const c=controls(),b=c?.binding;return b?.state?.current===s&&(c.hasHeldLogical?.('KeyD')===true||b.input?.current?.has('KeyD')===true||pointerIds.size>0);}
 function cast(s,hero,a=s){
  if(!authority(s)||!a||num(a.hp)<=0||!native.F.some(h=>h.id===heroId(s,a))||blocked(s))return null;
  if(!Action.decide('GUARD_START',{awake:false,latched:latched.has(a),active:!!session(s,a),statusLocked:false}).allowed)return null;
  window.__HAPIL_LOOP_V31365__?.cancelCharge(s,'D-resonance-priority');
  a.awakeningUntil=s.time;a.egoChargeAwakenUntilV31364=s.time;a.awakeningPrimedUntil=0;a.awakeningStoredPower=0;
  a.cooldowns??={};a.cooldowns.D=s.time;
  const m={world:s,zone:s.zone,hero:heroId(s,a),start:s.time,last:s.time,x:a.x,y:a.y,contacts:0,reduced:0,keys:new Map(),objects:new WeakMap(),token:Action.token(),inputScope:Action.forActor(s,a,controls()?.binding)};
  sessions.set(a,m);latched.add(a);currentWorld=s;a.channelDActiveV31364=true;a.channelDStartedV31364=s.time;
  a.moveVx=a.moveVy=0;a.dashingUntil=0;a.autoEvadeUntil31223=0;a.bufferedAction=null;if(a===s)(0,native.hi)(s);
  a.heroMotion={kind:'guard',started:s.time,until:s.time+.1,channelDActiveV31364:true,facing:num(a.facing,1),direction:a.direction,dx:0,dy:0,skillIndex:1};
  stats.casts++;return {charge:0,held:true,until:null,cooldownUntil:a.cooldowns.D??s.time};
 }
 function pin(s,a,m){a.x=m.x;a.y=m.y;a.moveVx=a.moveVy=0;a.dashingUntil=0;a.bufferedAction=null;a.invulnerableUntil=Math.max(num(a.invulnerableUntil),s.time+.2);a.autoEvadeUntil31223=0;
  if(a===s){a.target=null;a.path=[];a.stuckFor=0;}
  a.heroMotion={...a.heroMotion,kind:'guard',started:m.start,until:s.time+.1,channelDActiveV31364:true,dx:0,dy:0};
 }
 function tickActor(s,a,pressed){
  if(!pressed){end(s,a);latched.delete(a);return;}
  const m=session(s,a);if(!m)return;
  if(!active(s,a)){end(s,a,'blocked');return;}
  pin(s,a,m);const dt=Math.min(.1,Math.max(0,s.time-m.last));m.last=s.time;
  if(dt>0){const hp=num(a.hp),heal=config.healPerSecond*dt;if(window.__HAPIL_LOOP_V31365__)window.__HAPIL_LOOP_V31365__.heal(s,a,heal);else if(num(s.heroHealingBlockedUntil)<=s.time)a.hp=Math.min(num(a.maxHp,240),hp+(window.__HAPIL_RAID_RC24__?.healing(s,a,heal)??heal));stats.healed+=a.hp-hp;}
 }
 function tick(s){if(!s)return;currentWorld=s;tickActor(s,s,held(s));}
 function companion(s,a,pressed){if(pressed&&!latched.has(a)&&!session(s,a))cast(s,native.F.find(h=>h.id===a.heroId),a);tickActor(s,a,pressed);return active(s,a);}
 function beforeFrame(s,paused){if(currentWorld&&currentWorld!==s)clear(currentWorld);currentWorld=s;
  if(paused||!authority(s)||blocked(s)){clear(s);return;}
  if(!held(s)){end(s);latched.delete(s);}
 }
 function finish(s){if(!s)return;for(const a of [s,...(party()?.state===s?party().actors:[])]){const m=session(s,a);if(m&&active(s,a))pin(s,a,m);}}
 function eligible(s,q){
  if(!q||typeof q!=='object'||!(num(q.damage)>0)||!Number.isFinite(q.x)||!Number.isFinite(q.y))return false;
  if(q.reflected||q.friendly||q.visualOnly||q.heroSkillVfx||q.heroId31213||q.heroIdV31313||q.heroProjectileTransient||q.heroProjectileTransient31213||q.partySlotV31322||q.collabKey)return false;
  if(q.parriedV31356||q.projectileRemovalReason31215||q.themeTerminalV31323||q.themeEndedV31323||q.damageSuppressedV31226||q.reachedHero31213||q.reachedMapBoundary31213)return false;
  return (0,native.HAPIL_projectileVisibleV31355)(q,s.time)&&num(q.frozenUntil)<=s.time&&num(s.timeStopUntil)<=s.time&&num(q.collisionDisabledUntilV31226)<=s.time&&num(q.collisionDisabledUntil31219)<=s.time;
 }
 function convert(s,a){if(session(s,a))return false;return window.__HAPIL_COMBAT_CORE_V31401__.convert(s,a,()=>reduceConvertV31401(s,a));}
 function reduceConvertV31401(s,a){
  if(num(a.awakeningUntil)>s.time)return false;
  const b=controls()?.binding,level=a===s&&b?.state?.current===s?num((0,native.HAPIL_effectiveGrowthV31400)(b.passives?.current??{},s).awakening):0,p=(0,native.sr)(Math.max(1,level),heroId(s,a));
  end(s,a,'EGO');window.__HAPIL_COMBAT_CORE_V31401__.resource(s,a,'resonanceSpent',Math.max(0,num(a.resonance)));window.__HAPIL_COMBAT_CORE_V31401__.ego(s,a);a.resonance=0;const duration=Math.max(config.minimumAwakeningSeconds,p.duration);
  a.egoChargeAwakenUntilV31364=s.time+duration;a.awakeningUntil=s.time+duration;a.awakeningReadyAt=a.awakeningUntil+p.cooldown;
  a.awakeningNextAttackAt=s.time;a.awakeningNextAuraAt=s.time;a.awakeningPrimedUntil=0;a.awakeningPity=0;a.awakeningComboCount=0;a.awakeningCapstoneUsed=false;a.awakeningStoredPower=0;
  a.invulnerableUntil=Math.max(num(a.invulnerableUntil),s.time+config.conversionGraceSeconds);
  a.heroStatus='EGO · '+p.profile.name;a.heroStatusUntil=a.awakeningUntil;
  (s.floatTexts??=[]).push({id:s.fxSerial++,x:a.x,y:a.y,born:s.time,duration:1,text:'EGO 각성',color:native.F.find(h=>h.id===heroId(s,a))?.color??'#edf7ff',critical:true});
  window.__HAPIL_HERO_STYLE_V31364__?.observe(s);stats.conversions++;return true;
 }
 function credit(s,a,h,continuous=false){return window.__HAPIL_COMBAT_CORE_V31401__.credit(s,a,h,()=>reduceCreditV31401(s,a,h,continuous));}
 function reduceCreditV31401(s,a,h,continuous=false){const m=session(s,a);if(!m)return false;
  const key=h?.id!=null?[String(h.sourceId??h.ownerId??''),String(h.id),num(h.born,-1),String(h.shape??'')].join('|'):null;
  const last=key!==null?m.keys.get(key):h&&typeof h==='object'?m.objects.get(h):undefined;
  if(last!==undefined&&(!continuous||s.time-last<config.continuousContactInterval-1e-8)){stats.duplicates++;return false;}
  if(key!==null){m.keys.set(key,s.time);while(m.keys.size>config.maxContactRecords)m.keys.delete(m.keys.keys().next().value);}else if(h&&typeof h==='object')m.objects.set(h,s.time);
  m.contacts++;stats.contacts++;
  const heavy=h?.blockHeavyV31365??(h?.heavyBossSkill===true||h?.heavyHitClass31220==='telegraphed-major'||num(h?.damage)>=35);
  const resonanceBeforeV31401=Math.max(0,num(a.resonance));
  a.resonance=Math.min(100,resonanceBeforeV31401+(heavy?config.heavyResonancePerContact:config.resonancePerContact));
  window.__HAPIL_COMBAT_CORE_V31401__.resource(s,a,'resonanceAwarded',Math.max(0,a.resonance-resonanceBeforeV31401));
  window.__HAPIL_LOOP_V31365__?.heal(s,a,heavy?config.heavyHealPerContact:config.healPerContact);
  window.__HAPIL_LOOP_V31365__?.blockReward(s,a,h,heavy);
  const floor=Math.max(s.time,num(a.awakeningUntil)),delta=Math.min(config.awakeningReductionPerProjectile,Math.max(0,config.maxAwakeningReductionPerCast-m.reduced),Math.max(0,num(a.awakeningReadyAt)-floor));
  if(delta>0){a.awakeningReadyAt=Math.max(floor,a.awakeningReadyAt-delta);m.reduced+=delta;}
  window.__HAPIL_HERO_STYLE_V31364__?.emit(s,a,'block',.26);if(a.resonance>=100&&!session(s,a))convert(s,a);return true;
 }
 function blockDamage(s,a,h,damage){if(!active(s,a))return false;
  if(num(damage)>0&&h&&!h.friendly&&!h.reflected&&!h.visualOnly&&!h.heroSkillVfx&&num(h.born,-Infinity)<=s.time&&!h.damageSuppressedV31226)
   credit(s,a,h,!!(h.laserV31330||h.laser||h.shape==='line'||h.repeatInterval||h.themeExitV31327));
  return true;
 }
 function tryParry(s,q,a=s,verified=false){if(!active(s,a)||!eligible(s,q))return false;
  if(!verified&&window.__HAPIL_CONTACT_V31336__?.projectile(s,a,q)?.hit!==true)return false;
  q.blockHeavyV31365=q.heavyBossSkill===true||q.heavyHitClass31220==='telegraphed-major'||num(q.damage)>=35;
  q.parriedV31356=true;q.parriedAtV31356=s.time;q.parriedByV31356=a===s?'__host':String(a.slotId??'');
  q.damageSuppressedV31226=true;q.themeTerminalV31323=true;q.themeEndedV31323=true;q.exitHandledV31327=true;q.reachedHero31213=true;q.cancelled=true;
  (0,native.MONGSE_recordProjectileRemoval31215)(s,q,'parry');window.__HAPIL_COMBAT_V31333__?.markContact(s,q,a===s?'__host':String(a.slotId??''));credit(s,a,q);return true;
 }
 function effectiveLevel(s,level){return num(s?.egoChargeAwakenUntilV31364)>num(s?.time)&&num(s?.awakeningUntil)>num(s?.time)?Math.max(1,num(level)):level;}
 const api=Object.freeze({version:'3.13.65',installed:true,config,cast,end,clear,held,active,eligible,tryParry,blockDamage,credit,convert,tick,companion,beforeFrame,finish,effectiveLevel,
  draw:()=>false,snapshot:(s,a=s)=>{const m=session(s,a);return m?{started:m.start,held:true,contacts:m.contacts,reduced:m.reduced,active:active(s,a),x:m.x,y:m.y}:null;},metrics:()=>({...stats}),pointerIds,controllerVersion:'3.14.06-RC1',sessionToken:(s,a=s)=>sessions.get(a)?.token});
 window.__HAPIL_DEFENSE_V31356__=api;window.__HAPIL_CHANNEL_V31364__=api;
})();


 started=true;return root.__HAPIL_CHANNEL_V31364__;}
 root.__HAPIL_CHANNEL_FACTORY_V31406__=Object.freeze({install,get started(){return started;}});
})(window);
