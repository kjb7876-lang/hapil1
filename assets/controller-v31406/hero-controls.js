/* HAPIL 3.14.06: relocated native hero control owner.
 * Original control, practice, and HUD algorithms keep their order.
 * Native bindings are live getters/setters; no frozen React state snapshots.
 * Input-lifetime hardening is applied by build.py with exact source anchors. */
(function(root){'use strict';
 let started=false;
 function install(native){
  if(started)return root.__HAPIL_CONTROLS_V31329__;
  if(!native||typeof native!=='object')throw new TypeError('Hero controller requires live native bindings');
  if(!Object.getOwnPropertyDescriptor(native,"F")?.get)throw new TypeError('Missing live getter F');
  if(!Object.getOwnPropertyDescriptor(native,"HAPIL_driveAutoProgressV31301")?.get)throw new TypeError('Missing live getter HAPIL_driveAutoProgressV31301');
  if(!Object.getOwnPropertyDescriptor(native,"HAPIL_effectiveGrowthV31400")?.get)throw new TypeError('Missing live getter HAPIL_effectiveGrowthV31400');
  if(!Object.getOwnPropertyDescriptor(native,"J")?.get)throw new TypeError('Missing live getter J');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_ASSET_VERSION")?.get)throw new TypeError('Missing live getter MONGSE_ASSET_VERSION');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_clearHostileProjectiles31215")?.get)throw new TypeError('Missing live getter MONGSE_clearHostileProjectiles31215');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_combatDistance")?.get)throw new TypeError('Missing live getter MONGSE_combatDistance');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_heroRoleProfile31222")?.get)throw new TypeError('Missing live getter MONGSE_heroRoleProfile31222');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_isEncounterLocked31226")?.get)throw new TypeError('Missing live getter MONGSE_isEncounterLocked31226');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_objectiveDamageAllowedV31309")?.get)throw new TypeError('Missing live getter MONGSE_objectiveDamageAllowedV31309');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_resetHeroAutoDodge31223")?.get)throw new TypeError('Missing live getter MONGSE_resetHeroAutoDodge31223');
  if(!Object.getOwnPropertyDescriptor(native,"MONGSE_writeSave")?.get)throw new TypeError('Missing live getter MONGSE_writeSave');
  if(!Object.getOwnPropertyDescriptor(native,"ar")?.get)throw new TypeError('Missing live getter ar');
  if(!Object.getOwnPropertyDescriptor(native,"hi")?.get)throw new TypeError('Missing live getter hi');
  if(!Object.getOwnPropertyDescriptor(native,"ir")?.get)throw new TypeError('Missing live getter ir');
  if(!Object.getOwnPropertyDescriptor(native,"oi")?.get)throw new TypeError('Missing live getter oi');
  started=true;
/* HAPIL 3.13.29: explicit human control modes, physical-key routing and isolated rehearsal.
 * No damage multipliers or original narrative assets are changed by the control mode.
 */
(()=>{'use strict';
 const VERSION='3.13.29', MODES=['manual','semi','full'], TITLES={manual:'수동',semi:'반자동',full:'완전자동'};
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d, P=()=>window.__HAPIL_PARTY_V31322__;
 let binding=null, previousMode=null, previousLocal=null, practice=null, practicePending=false, installTries=0;
 const keyScopes=new Map();let lastScope=null,clearingInput=false;
 const inputMetrics={orphanRepeatsIgnored:0,staleReleasesCancelled:0,lifecycleClears:0};
 const held=new Map(), diagnostics={actions:0,semiAttacks:0,blocked:0,modeChanges:0,practiceStarts:0,damageEvents:0};
 const P1_LOCAL={KeyW:'ArrowUp',KeyA:'ArrowLeft',KeyS:'ArrowDown',KeyD:'ArrowRight',Digit1:'KeyQ',Digit2:'KeyW',Digit3:'KeyE',Digit4:'KeyR',Digit5:'KeyS',Digit6:'KeyA',KeyQ:'KeyG',KeyE:'KeyD',KeyF:'KeyF',KeyC:'Collab',KeyV:'Tab',KeyB:'KeyM',F1:'Settings'};
 const SOLO={ArrowUp:'ArrowUp',ArrowLeft:'ArrowLeft',ArrowDown:'ArrowDown',ArrowRight:'ArrowRight',KeyA:'KeyA',KeyS:'KeyS',Space:'KeyS',KeyD:'KeyD',KeyF:'KeyF',KeyQ:'KeyQ',KeyW:'KeyW',KeyE:'KeyE',KeyR:'KeyR',Digit1:'KeyG',Digit2:'Collab',Digit3:'Tab',Digit4:'KeyM',Digit5:'Settings',F1:'Settings'};
 const P2_MOVE={ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0]};
 const P2_ACTION={Numpad1:'q',Numpad2:'w',Numpad3:'e',Numpad4:'r',Numpad5:'dash',Numpad6:'attack',KeyJ:'q',KeyK:'w',KeyL:'e',KeyU:'r',KeyI:'dash',KeyO:'attack',KeyP:'guard',Numpad7:'guard'};
 function localTwo(){const p=P();return !!p&&p.status?.role!=='guest'&&(p.roster??[]).some(r=>r.control==='local');}
 function choice(settings=binding?.settings?.current){const v=settings?.combatMode;return MODES.includes(v)?v:settings?.autoCombat===true?'full':'manual';}
 function effective(settings=binding?.settings?.current){const m=choice(settings);return localTwo()&&m==='manual'?'semi':m;}
 function label(key){if(localTwo())return ({A:'6',S:'5',Q:'1',W:'2',E:'3',R:'4',G:'Q',D:'E',F:'F',Collab:'C',Tab:'V',M:'B',Settings:'F1'})[key]??key;return ({G:'1',Collab:'2',Tab:'3',M:'4',Settings:'5'})[key]??key;}
 const Action=window.__HAPIL_ACTION_CONTRACT_V31406__;
 function scopeOf(b=binding){return Action.capture(b);}
 function sameScope(a,b){return Action.same(a,b);}
 function cancelScope(scope,reason){if(!scope?.s)return;window.__HAPIL_LOOP_V31365__?.cancelCharge(scope.s,reason);window.__HAPIL_CHANNEL_V31364__?.end(scope.s,scope.s,reason);}
 function discardScopedKeys(reason){
  const pending=[...keyScopes.values()];keyScopes.clear();held.clear();const current=binding?.state?.current,seen=new Set();
  for(const row of pending){if(row.scope?.s!==current&&!seen.has(row.scope?.s)){seen.add(row.scope?.s);cancelScope(row.scope,reason);}
   const input=row.scope?.input,key=row.logical;
   if(input&&!window.__HAPIL_MOBILE_V31343__?.owns(input,key)&&!window.__HAPIL_MOBILE_V31366__?.owns(input,key))input.delete(key);
  }
 }
 function syncLifecycle(s=binding?.state?.current,paused=false){const current=scopeOf(),changed=!!lastScope&&!sameScope(lastScope,current);
  const blocked=paused||!current||binding?.phase!=='game'||n(s?.hp)<=0||isBlocked();
  if((changed||blocked)&&(held.size||keyScopes.size||window.__HAPIL_MOBILE_V31366__?.hasPointers?.()||window.__HAPIL_LOOP_V31365__?.isCharging?.(s)||window.__HAPIL_CHANNEL_V31364__?.active?.(s))){inputMetrics.lifecycleClears++;clear(changed?'world-or-input-context':'paused-or-blocked');}
  lastScope=current;return !blocked;
 }
 function inputSnapshot(){const now=scopeOf();return{version:'3.14.06-RC1',phase:String(binding?.phase??''),zone:String(now?.zone??''),hero:String(now?.hero??''),held:[...held].map(([code,logical])=>({code,logical,current:sameScope(keyScopes.get(code)?.scope,now)})),metrics:{...inputMetrics},policy:{physicalRepeatRequiresPress:true,releaseBoundToPressContext:true,chargeCancelIsNotRelease:true}};}
 function bind(b){binding=b;syncLifecycle(b?.state?.current,false);return b;}
 function clear(reason='clear'){if(clearingInput)return;clearingInput=true;try{discardScopedKeys(typeof reason==='string'?reason:'lifecycle');window.__HAPIL_SIMPLE_V31368__?.reset(binding?.state?.current);window.__HAPIL_MOBILE_V31366__?.clear('controls-clear');window.__HAPIL_LOOP_V31365__?.cancelCharge(binding?.state?.current,'input-clear');window.__HAPIL_CHANNEL_V31364__?.clear(binding?.state?.current);held.clear();window.__HAPIL_MOBILE_V31343__?.clear(binding?.input?.current);binding?.input?.current?.clear?.();window.__HAPIL_MOVEMENT_V31336__?.clear(binding?.state?.current);for(const a of P()?.actors??[])if(a.control==='local')localMemory.delete(a);if(binding?.state?.current)binding.state.current.bufferedAction=null;}finally{lastScope=scopeOf();clearingInput=false;}}
 function setMode(value,setter=binding?.setSettings){if(!MODES.includes(value))return false;const next=localTwo()&&value==='manual'?'semi':value;clear();if(typeof setter==='function')setter(s=>({...s,combatMode:next,autoCombat:next==='full'}));else if(binding?.settings)binding.settings.current={...binding.settings.current,combatMode:next,autoCombat:next==='full'};diagnostics.modeChanges++;return next;}
 const editing=t=>!!t?.closest?.('input,textarea,select,[contenteditable="true"]');
 function route(code,isLocal=localTwo()){const key=(isLocal?P1_LOCAL:SOLO)[code]??null;return window.__HAPIL_SIMPLE_V31368__?window.__HAPIL_SIMPLE_V31368__.physical(key,isLocal):key;}
 function isBlocked(){return window.__HAPIL_RECORDS_V31365__?.isOpen()===true||!binding||binding.phase!=='game'||!!binding.modal?.current||binding.blocked?.()||document.hidden===true||P()?.blocksNativeInput?.()===true||window.__HAPIL_PARTY_UI_V31322__?.isOpen?.();}
 function dispatch(code){const b=binding,s=b?.state?.current;if(!s)return false;const a=b.actions;
   if(code==='Settings'){clear();a.settings();return true;}
   if(isBlocked()){diagnostics.blocked++;return false;}
   if(code!=='KeyF'&&(0,native.MONGSE_isEncounterLocked31226)(s))return false;
   if(code==='KeyA')window.__HAPIL_SIMPLE_V31368__?.noteA(s);
   if(code==='KeyS' && !window.__HAPIL_SIMPLE_V31368__?.isAutomatic?.(s) && Action.decide('MANUAL_BLINK',{defending:!!window.__HAPIL_CHANNEL_V31364__?.active(s),cooldownReady:true,statusLocked:!!window.__HAPIL_MOVEMENT_V31336__?.dashLocked(s,s),charging:!!window.__HAPIL_LOOP_V31365__?.isCharging(s)}).allowed) window.__HAPIL_LOOP_V31365__?.cancelCharge(s,'manual-blink');
   if(code==='KeyA'&&window.__HAPIL_LOOP_V31365__?.pressA(s))return true;
   if(['KeyA','KeyS','KeyQ','KeyW','KeyE','KeyR'].includes(code))s.bufferedAction={code,until:s.time+.16};
   const before={attack:s.lastAttack,dash:s.lastDodgeAt,skill:n(s.cooldowns?.[code.slice(-1)]),call:s.supportCall};
   if(code==='KeyA')a.attack();else if(code==='KeyS')a.dash();else if(code==='KeyD')a.guard();else if(code==='KeyG')a.resonance();else if(code==='Collab')a.collab();else if(code==='KeyF')a.interact();else if(code==='Tab')a.target();else if(code==='KeyM')a.map();else if(/^Key[QWER]$/.test(code))a.skill(['Q','W','E','R'].indexOf(code.slice(-1)));else return false;
   if(s.lastAttack!==before.attack||s.lastDodgeAt!==before.dash||n(s.cooldowns?.[code.slice(-1)])!==before.skill||s.supportCall!==before.call)diagnostics.actions++;
   s.manualControlUntilV31329=s.time+.28;return true;
 }
 function key(e,down){if(!binding)return false;
   // Releases use the key-down mapping, even when mode/roster changes mid-press.
   if(!down){const row=keyScopes.get(e.code),logical=held.get(e.code);keyScopes.delete(e.code);held.delete(e.code);
    if(row&&(!sameScope(row.scope,scopeOf())||isBlocked()||n(binding?.state?.current?.hp)<=0)){
     inputMetrics.staleReleasesCancelled++;cancelScope(row.scope,'stale-key-release');
     if(row.scope?.input&&!Array.from(held.values()).includes(logical)&&!window.__HAPIL_MOBILE_V31343__?.owns(row.scope.input,logical)&&!window.__HAPIL_MOBILE_V31366__?.owns(row.scope.input,logical))row.scope.input.delete(logical);
     return !!logical;
    }
if(logical==='KeyA'&&!Array.from(held.values()).includes(logical)&&!(binding.state.current.chargePointersV31365?.length))window.__HAPIL_LOOP_V31365__?.releaseA(binding.state.current);if(logical==='KeyD'&&!Array.from(held.values()).includes(logical)&&!window.__HAPIL_CHANNEL_V31364__?.pointerIds?.size)window.__HAPIL_CHANNEL_V31364__?.end(binding.state.current);if(logical&&!Array.from(held.values()).includes(logical)&&!window.__HAPIL_MOBILE_V31343__?.owns(binding.input.current,logical)&&!window.__HAPIL_MOBILE_V31366__?.owns(binding.input.current,logical))binding.input.current.delete(logical);return !!logical;}
   if(e.code==='Escape'){clear();binding.actions.escape();return true;}
   if(e.ctrlKey||e.metaKey||e.altKey||editing(e.target)){clear();return false;}
   if(binding.phase==='game'&&binding.state?.current)frameStart(binding.state.current,0);
   const logical=route(e.code);if(!logical||binding.phase!=='game')return false;
   e.preventDefault?.();if(isBlocked()){diagnostics.blocked++;clear();return false;}
   if(e.repeat===true&&!held.has(e.code)){inputMetrics.orphanRepeatsIgnored++;return true;}
   const repeated=e.repeat===true||held.has(e.code);held.set(e.code,logical);if(!repeated)keyScopes.set(e.code,{logical,scope:scopeOf()});
   if(logical.startsWith('Arrow')){binding.input.current.add(logical);return true;}
   if(logical==='KeyA'||logical==='KeyD')binding.input.current.add(logical);
   if(!repeated)return dispatch(logical);return true;
 }
 function frameStart(s,dt,b){if(b)binding={...binding,...b};if(!s)return;syncLifecycle(s,false);
   const mode=effective(),local=localTwo();
   if(previousMode!==null&&(mode!==previousMode||local!==previousLocal)){clear();if(s.target?.autoProgressV31301||previousMode==='full'){(0,native.hi)(s);s.moveVx=s.moveVy=0;}(0,native.MONGSE_resetHeroAutoDodge31223)(s,'control-mode-change');}
   previousMode=mode;previousLocal=local;s.combatModeV31329=mode;if(binding?.auto)binding.auto.current=mode==='full';window.__HAPIL_MOVEMENT_V31336__?.host(s,binding?.input?.current);
 }
 function tickBasic(s,dt,env){const b=env??binding;if(!s||!b||dt<=0||b.paused||P()?.blocksNativeInput?.()||s.hp<=0||(0,native.MONGSE_isEncounterLocked31226)(s))return false;
   if(s.practicePatternV31365?.finished)return false;
   const m=effective(b.settings?.current),manual=b.input?.current?.has('KeyA')||window.__HAPIL_LOOP_V31365__?.pendingChargeTier?.(s)>0;if(m==='manual'&&!manual)return false;
   if(binding&&isBlocked())return false;
   if(s.bufferedAction||n(s.manualControlUntilV31329)>s.time)return false;
   const motion=s.heroMotion;if(window.__HAPIL_MOVING_V31335__?.hardLocked(s,s)||motion?.until>s.time&&['skill','ultimate','guard','hurt','dash'].includes(motion.kind))return false;
   const h=native.F.find(h=>h.id===(b.hero?.current??s.activeHeroId))??native.F[0],range=((window.__HAPIL_LOOP_V31365__?.role(h.id).range??(0,native.MONGSE_heroRoleProfile31222)(h.id).basicAttackRange)-10)*(0,native.ar)((0,native.ir)((0,native.HAPIL_effectiveGrowthV31400)(b.passives?.current??{},s),'attack')).reachMultiplier+10;
   const targets=(s.enemies??[]).filter(t=>(window.__HAPIL_COMBAT_V31343__?.validTarget(s,t)??(t.hp>0&&!t.visualOnly&&!t.protectedNarrativeTargetV31307&&!t.phaseTransitionActive&&(0,native.MONGSE_objectiveDamageAllowedV31309)(s,t)))&&(0,native.MONGSE_combatDistance)(s,t)<=range).sort((a,c)=>(0,native.J)(s,a)-(0,native.J)(s,c));
   if(!targets.length)return false;if(!targets.some(t=>t.id===s.targetEnemyId))s.targetEnemyId=targets[0].id;
   const at=s.lastAttack;const attack=b.actions?.attack??b.attack;if(window.__HAPIL_COMBAT_V31343__)window.__HAPIL_COMBAT_V31343__.basic(s,!manual,attack);else attack?.();if(s.lastAttack!==at){if(m==='semi')diagnostics.semiAttacks++;return true;}return false;
 }
 const localMemory=new WeakMap();
 function companion(s,a,raw,dt,index,makeAI){if(a.control!=='local')return raw;const mode=effective();let mem=localMemory.get(a);if(!mem){mem={seq:-1,queue:[],override:0};localMemory.set(a,mem);}const human=raw??{moveX:0,moveY:0,actions:{}};
   if(Number.isSafeInteger(human.seq)&&human.seq!==mem.seq){mem.seq=human.seq;for(const k of ['ultimate','skill3','skill2','skill1','dash'])if(human.actions?.[k]&&mem.queue.length<12)mem.queue.push(k);}
   const moving=Math.hypot(n(human.moveX),n(human.moveY))>.01;if(moving||mem.queue.length)mem.override=s.time+(window.__HAPIL_MOVEMENT_V31336__?.config.manualPrioritySeconds??.2);
   let input=mode==='full'&&s.time>=mem.override?makeAI(s,a,index):{moveX:n(human.moveX),moveY:n(human.moveY),actions:{attack:true}};
   input={...input,actions:{...input.actions}};const busy=a.heroMotion?.until>s.time&&['skill','hurt','guard','dash'].includes(a.heroMotion?.kind);if(busy)input.actions.attack=false;const dashAt=mem.queue.indexOf('dash');const requested=dashAt>=0?mem.queue.splice(dashAt,1)[0]:busy?null:mem.queue.shift();if(requested){for(const k of ['ultimate','skill3','skill2','skill1','skill'])input.actions[k]=false;input.actions[requested]=true;}
   if(human.actions?.attack&&!busy)input.actions.attack=true;return input;
 }
 function hitType(source){if(source?.laserV31330)return '광맥 레이저';if(source?.exitDamageV31327||source?.themeExitHitV31326)return '퇴장 잔류탄';if(source?.themeMechanicV31323==='chain')return '사슬 속박';if(source?.themeMechanicV31323==='contamination')return '오염 지대';if(source?.themeFollowupV31323)return '후속 폭발';return source?.cosmicModeV31318==='blood-beam'?'피 레이저':source?.cosmicModeV31318==='reliquary'?'비석 낙하':source?.boss||source?.midboss?'보스 본 공격':'적 본 공격';}
 function recordDamage(s,a,source,loss){if(!s||!(loss>0))return;const actor=(s.enemies??[]).find(e=>e.id===(source?.sourceId??source?.ownerId));
   const row={at:s.time,kind:hitType(source),damage:Math.round(loss*10)/10,source:String(actor?.name??source?.label??'적 공격').slice(0,64),slot:a===s?'1P':String(a.slotId??'동료'),mode:s.combatModeV31329??effective()};
   s.combatFeedbackV31329=[...(s.combatFeedbackV31329??[]),row].slice(-8);diagnostics.damageEvents++;if(s.practiceV31329){s.practiceHitCountV31329=n(s.practiceHitCountV31329)+1;s.practiceDamageTakenV31329=n(s.practiceDamageTakenV31329)+loss;}
   if(row.kind==='퇴장 잔류탄')s.floatTexts?.push({id:s.fxSerial++,x:a.x,y:a.y,born:s.time,duration:.65,text:'잔류탄',color:'#e8c895',critical:false});
 }
 const guideMemory=new WeakMap();
 function guide(s){if(!s)return {stage:0};let g=guideMemory.get(s);if(!g){g={stage:0,x:s.x,y:s.y,distance:0,attack:n(s.basicAttackCount),dash:n(s.lastDodgeAt),skill:Math.max(...['Q','W','E'].map(k=>n(s.cooldowns?.[k]))),at:s.time};guideMemory.set(s,g);}const d=Math.hypot(s.x-g.x,s.y-g.y);if(d<2)g.distance+=d;g.x=s.x;g.y=s.y;
   const ready=g.stage===0?g.distance>=1.5&&n(s.basicAttackCount)>g.attack:g.stage===1?n(s.lastDodgeAt)>g.dash:g.stage===2?Math.max(...['Q','W','E'].map(k=>n(s.cooldowns?.[k])))>g.skill:!!s.supportCall||n(s.cooldowns?.G)>0||n(s.cooldowns?.D)>0;
   if(g.stage<4&&ready&&s.time-g.at>2){g.stage++;g.at=s.time;}return g;
 }
 function practiceStart(options=null){if(!binding||binding.phase!=='game')throw Error('먼저 게임을 시작한 뒤 체험전을 선택하세요.');if(practice)return false;if(P()?.status?.role==='guest'||P()?.status?.disconnected)throw Error('친구가 모두 참가하고 방장이 파티 출발을 누른 뒤 체험전을 시작하세요.');if(binding.state.current?.practiceV31329)return false;
   const b=binding,old=b.state.current;practicePending=true;clear();
   practice={state:old,passives:b.passives.current,shards:b.shards.current,settings:{...b.settings.current},roster:P()?.roster,partyMode:P()?.status?.mode,network:P()?.status?.role==='host',hero:b.hero.current,support:P()?.supportHeroId,actors:P()?.actors.map(a=>({...a,skillReady:[...a.skillReady],heroMotion:{...a.heroMotion}}))??[]};
   const s=(0,native.oi)();Object.assign(s,{zone:'ep1a11',frontierZone:'ep1a11',time:10,x:14,y:15,activeHeroId:b.hero.current,hp:240,maxHp:240,cosmicEncounterV31318:{stage:'active'},bossDefeated:false,practiceV31329:true,raidV31330:P()?.status?.role==='host',spawnedWaves:new Set([1,2,3,4]),completedWaves31228:new Set([1,2,3,4]),zoneEntryFlowZone31226:'ep1a11',narrativeCombatZoneV31238:'ep1a11',narrativeCombatEntryAtV31238:0,encounterDialogue31226:null,encounterLockUntil31226:0,encounterWallUnlockAtV31227:0,invulnerableUntil:12.5});
   window.__HAPIL_RUN_V31400__.inherit(s,old);const boss=options?window.__HAPIL_RECORDS_V31365__.configure(s,options):window.__HAPIL_LUCIFER_V31318__.makeActor(s.time);if(!options){boss.maxHp*=.35;boss.hp=boss.maxHp;s.enemies=[boss];}s.targetEnemyId=boss.id;s.practiceStartedAtV31329=s.time;
   b.state.current=s;b.passives.current=options?{...practice.passives}:{attack:2,cooldown:1};b.shards.current=0;
   b.setSettings(v=>({...v,autoPortal:false,autoStoryAdvance:false,autoSkillTree:false,guideHints:true}));
   P()?.capture(s,{damage:b.actions.damage,heroRef:b.hero,cache:b.cache?.current},false);if(options)window.__HAPIL_MODES_V31346__?.set(options.mode,s);else window.__HAPIL_HELL_V31322__?.setEnabled(false,s);
   b.actions.dismiss();practicePending=false;diagnostics.practiceStarts++;return true;
 }
 function beforeDeath(s,a){if(s!==binding?.state?.current||!s.practiceV31329||P()?.status?.role==='guest'||!a?.cosmicLuciferV31318||a.hp>0)return false;
   s.enemies=s.enemies.filter(e=>e!==a);s.pendingHits=[];s.impactQueue=[];s.pendingStrikes=[];(0,native.MONGSE_clearHostileProjectiles31215)(s,'practice-complete');window.__HAPIL_EXIT_V31327__?.reset(s);s.bossDefeated=true;s.cosmicEncounterV31318={stage:'complete'};s.practiceFinishedAtV31329=s.time;binding?.notify?.('루시퍼 체험 완료 · 본편 보상이나 진행도는 변경되지 않습니다.');return true;
 }
 function practiceEnd(){if(!practice||!binding||P()?.status?.role==='guest')return false;const b=binding,save=practice;clear();window.__HAPIL_EXIT_V31327__?.reset(b.state.current);
   b.state.current=save.state;b.passives.current=save.passives;b.shards.current=save.shards;b.hero.current=save.hero;
   P()?.capture(save.state,{damage:b.actions.damage,heroRef:b.hero,cache:b.cache?.current},false);
   if(save.roster?.length)P()?.configure({mode:save.partyMode??'solo',roster:save.roster,hell:!!save.state.hellModeV31322,supportHeroId:save.support});
   else {P()?.leave();P()?.capture(save.state,{damage:b.actions.damage,heroRef:b.hero,cache:b.cache?.current},false);window.__HAPIL_PARTY_LAUNCH_V31322__?.setLeader?.(save.hero);window.__HAPIL_HELL_V31322__?.setEnabled(!!save.state.hellModeV31322,save.state);}
   // Settle the zone switch, then restore local/AI actor health and cooldowns.
   P()?.tick(save.state,0);for(const a of P()?.actors??[]){const old=save.actors.find(x=>x.slotId===a.slotId);if(old)Object.assign(a,old);}
   window.__HAPIL_MODES_V31346__?.set(save.state.gameModeV31346??'STORY',save.state);practice=null;practicePending=false;b.setSettings(()=>save.settings);b.actions.dismiss();return true;
 }
 function renderHUD(){if(!binding||!document?.getElementById)return;const s=binding.state.current,root=document.getElementById('hapil-control-hud-v31329');if(!root)return;root.hidden=binding.phase!=='game';if(root.hidden)return;
   const mode=effective(),local=localTwo(),g=guide(s),show=binding.settings.current.guideHints!==false;
   root.querySelector('[data-mode]').textContent=(local?'2인 · ':'')+TITLES[mode]+(s.practiceV31329?(s.raidV31330?' · 루시퍼 협동 체험 (저장 안 함)':' · 루시퍼 체험 (저장 안 함)'):'');
   const tips=local?['WASD / 방향키로 이동하세요. 기본 공격은 자동입니다.','양쪽 5번으로 예고 범위를 피하세요. 숫자패드 없이 2P I도 가능합니다.','양쪽 1~4로 스킬을 직접 사용하세요. 2P J/K/L/U 대체키도 가능합니다.','1P Q 공명실 · C 콜라보. 본체가 회복하는 틈을 노리세요.','본 공격과 잔류탄을 구별하고 스킬 타이밍을 직접 조절하세요.']:['방향키·마우스로 이동하세요. 전투는 A 사격과 D 공명 방어 중심입니다. A 입력 중 준비된 기술을 순차 사용합니다.','임박한 탄막과 안전 착지가 확인되면 S 블링크가 쿨다운에 맞춰 자동 발동합니다.','Q/W/E/R·공명실·콜라보는 A 입력 또는 자동 모드에서 준비되면 순차 발동합니다. 자동 E는 원거리 투사입니다.','D 유지: 정지·무적·회복 / 실제 차단으로 공명 / 100 EGO / EGO 중 A 홀드·해제 차지','공격 준비 → 위험 회피 → 반격. 5에서 전투 모드를 바꿀 수 있습니다.'];
   root.querySelector('[data-guide]').textContent=show?`${Math.min(4,g.stage+1)}/4 · ${tips[g.stage]}`:(local?'1P WASD + 1~6 / 2P 방향키 + Num1~6 (J K L U I O)':'이동 방향키·마우스 / A S D F · Q W E R · 1 2 3 4 5');
   const hit=s.combatFeedbackV31329?.at(-1);root.querySelector('[data-hit]').textContent=hit&&s.time-hit.at<8?`${hit.slot} ${hit.kind} −${hit.damage} · ${hit.source}`:'퇴장 이미지는 약한 접촉 피해 · 숨겨진 경로에는 피해 없음';
   window.__HAPIL_READABILITY_V31336__?.presentSaveNotice(root);
   root.querySelector('[data-return]').hidden=!practice||P()?.status?.role==='guest';root.querySelector('[data-practice]').hidden=!!s.practiceV31329||P()?.status?.role==='guest';
   document.body.dataset.hapilGuide=show&&!local?String(g.stage):'4';
   if(s.practiceV31329&&s.cosmicEncounterV31318?.stage==='complete')root.querySelector('[data-guide]').textContent=`체험전 승리 · ${Math.max(0,n(s.practiceFinishedAtV31329,s.time)-n(s.practiceStartedAtV31329)).toFixed(0)}초 · 파티 피격 ${n(s.practiceHitCountV31329)}회 · 캠페인 복귀로 종료`;
 }
 function install(){if(!window.__HAPIL_V31327_RELEASE__){if(++installTries<512)setTimeout(install,0);return false;}
   const write=native.MONGSE_writeSave;native.MONGSE_writeSave=function(...args){if(practice||practicePending||binding?.state?.current?.practiceV31329)return {ok:false,persistent:false,reason:'isolated-practice'};return write(...args);};
   const progress=native.HAPIL_driveAutoProgressV31301;native.HAPIL_driveAutoProgressV31301=function(s,settings,blocked,...a){if(s?.practiceV31329)return {action:'wait',reason:'isolated-practice'};return progress(s,settings,blocked,...a);};
   // Player damage notices follow theme status in combat-core-v31401.
   window.addEventListener?.('blur',clear);document.addEventListener?.('visibilitychange',clear);
   window.__HAPIL_CONTROLS_V31329__={version:VERSION,installed:true,controllerVersion:'3.14.06-RC1',syncLifecycle,inputSnapshot,bind,choice,effective,localTwo,label,setMode,route,key,clear,dispatch,frameStart,tickBasic,companion,recordDamage,hitType,guide,practiceStart,practiceEnd,beforeDeath,renderHUD,hasPractice:()=>!!practice,blocksSave:()=>!!practice||practicePending||binding?.state?.current?.practiceV31329===true,metrics:()=>({...diagnostics}),get binding(){return binding;},localInputBlocked:()=>!binding||binding.phase!=='game'||!!binding.modal?.current||binding.blocked?.()||document.hidden===true||P()?.status?.disconnected===true||P()?.status?.role==='guest'||window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()===true||!!(binding?.state?.current&&(0,native.MONGSE_isEncounterLocked31226)(binding.state.current)),clearCompanion:a=>a&&localMemory.delete(a),hasHeldLogical:logical=>Array.from(held.values()).includes(logical),keys:{solo:SOLO,p1:P1_LOCAL,p2Move:P2_MOVE,p2Action:P2_ACTION}};
   native.MONGSE_ASSET_VERSION='31329';window.MONGSE_ASSET_VERSION='31329';
   window.__HAPIL_V31329_RELEASE__=Object.freeze({version:VERSION,installed:true,activeBundle:'index-v31329.js',cacheKey:31329,baseVersion:'3.13.28',saveRevision:14});
   if(document.createElement&&document.body&&!document.getElementById('hapil-control-hud-v31329')){const root=document.createElement('aside');root.id='hapil-control-hud-v31329';root.setAttribute('aria-label','조작 모드와 피격 피드백');root.hidden=true;root.innerHTML='<div><strong data-mode></strong><button type="button" data-controls>전투 설정</button><button type="button" data-practice>루시퍼 체험</button><button type="button" data-return hidden>캠페인 복귀</button></div><p data-guide></p><small data-hit></small><small data-save-notice-v31336 role="status" aria-live="polite" hidden></small>';document.body.appendChild(root);root.querySelector('[data-controls]')?.addEventListener('click',()=>binding?.actions.settings());root.querySelector('[data-practice]')?.addEventListener('click',()=>{try{practiceStart();}catch(e){binding?.notify?.(e.message);}});root.querySelector('[data-return]')?.addEventListener('click',practiceEnd);window.setInterval?.(renderHUD,200);}
   return true;
 }
 install();
})();



  return root.__HAPIL_CONTROLS_V31329__;
 }
 root.__HAPIL_HERO_CONTROL_FACTORY_V31406__=Object.freeze({version:'3.14.06-RC1',install,get started(){return started;}});
})(typeof window!=='undefined'?window:globalThis);
