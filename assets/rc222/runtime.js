/* RC222: host-owned native actor adapter. No alternate attack formula lives here. */
(function (root) {
  'use strict';
  const VERSION = 'RC222';
  const HEROES = ['hwando','gunner','seoha','neon','michaela','lauren','hunter','slayer'];
  const ACTIONS = new Set(['attack','q','w','e','r','dash','guard','resonance','time','collab','chargeStart','chargeRelease','reviveSamong','reviveCheckpoint']);
  const OWN = new Set(['x','y','hp','maxHp','facing','direction','directionLockUntil','moveVx','moveVy','target','targetEnemyId','path','stuckFor','bufferedAction','cooldowns','combo','comboUntil','counterUntil','damageBuffUntil','resonance','graze','invulnerableUntil','slowUntil','staggerUntil','hitUntil','hitStarted','dashingUntil','downUntil','readyAt','skillReady','ultimateReady','dashReady','supportReadyAt','supportRollAt','supportCall','activeHeroId','activeHeroMastery','activeTimeMastery','lifestealSuppressedUntil','lifestealMultiplier','temporalHistory','temporalRecordAt','temporalLagPassiveReadyAt31214','temporalLagFieldReadyAt31214','temporalResumeSoundReadyAt31215','projectileStasisReadyAt','timeAccelerationUntil','timeAccelerationReadyAt','timeLaybackReadyAt','timeStopReadyAt','timeRewindReadyAt','samongPassiveRC91','samongEgoRC133','samongDamageRC108','chargePointersV31365','shmupSanctuaryV31365','shmupFxV31365','combatModeV31329','basicAttackCount','autoSkillNextAt','autoSkillCycle','autoSkillHistory','manualControlUntilV31329','chargeStartV31365','chargeLevelV31365','egoChargeAwakenUntilV31364','procAttackV31513','heroDoctrineV31400']);
  const owned = key => typeof key === 'string' && (OWN.has(key) || /^(?:hero(?!Id)|awakening|egoCharge|blinkResonance|resonanceOrigin|temporal(?:Hud|Resonance)|last(?:Attack|Dodge|Manual|Lifesteal|Auto|AcceptedContact)|auto(?:Decision|Evade|Dodge|Combat|Growth)|channelD|shmupRelease|simpleDodge|charge(?:Start|Level)|graze(?:Chain|Reward)|comboReward|chainRewardZone|lifestealSuppression|blackSun|sevenSinMechanicHits|samongDamage|guardianGrace|consecutiveContact|contactDamage|heavyHitDamage|rangedStart|themeRoot|themeAim|root(?:Zone|Feedback)|manualMovement|rc127(?:Defense|MovementSpeed)|timeLaybackField|alignmentDash)/.test(key));
  const num = (v, d=0) => typeof v === 'number' && Number.isFinite(v) ? v : d;
  const clamp = v => Math.max(-1, Math.min(1,num(v)));
  const clone = (v, seen=new Map()) => {
    if (!v || typeof v !== 'object') return v;
    if (seen.has(v)) return seen.get(v);
    const out=v instanceof Set?new Set():v instanceof Map?new Map():Array.isArray(v)?[]:{};seen.set(v,out);
    if(v instanceof Set)for(const x of v)out.add(clone(x,seen));
    else if(v instanceof Map)for(const [k,x]of v)out.set(clone(k,seen),clone(x,seen));
    else for(const k of Object.keys(v))if(!['__proto__','constructor','prototype'].includes(k)&&typeof v[k]!=='function')out[k]=clone(v[k],seen);
    return out;
  };
  // The storage bridge accepts portable data and retains nonfinite sentinels itself.
  function portable(v,decode=false) {
    if(!v||typeof v!=='object')return v;
    if(decode&&Array.isArray(v.$hapilSet))return new Set(v.$hapilSet.map(x=>portable(x,true)));
    if(decode&&Array.isArray(v.$hapilMap))return new Map(v.$hapilMap.map(x=>portable(x,true)));
    if(v instanceof Set)return {$hapilSet:[...v].map(x=>portable(x))};
    if(v instanceof Map)return {$hapilMap:[...v].map(x=>portable(x))};
    if(Array.isArray(v))return v.map(x=>portable(x,decode));
    const out={};for(const key of Object.keys(v))if(!['__proto__','constructor','prototype'].includes(key)&&v[key]!==undefined&&typeof v[key]!=='function')out[key]=portable(v[key],decode);return out;
  }
  function createRuntime(env=root) {
    const getParty=()=>env.__HAPIL_PARTY_V31322__, controls=()=>env.__HAPIL_CONTROLS_V31329__, binding=()=>controls()?.binding;
    const native=()=>env.__HAPIL_RC222_NATIVE__??{};
    const contexts=new WeakMap(), incoming=new Map(), held=new Set(), inputEdges=[];let interpolation=[],buffAdapter=null;
    let room=null, currentRole='offline', epoch=0, wireSeq=-1, nativeSeq=0, transaction=null, capture=null, attached=false, localAuto='manual', inputSeq=0, hostZone=null,rosterSignature='',narrative=null,narrativeKey='',localWorldRef=null,nativeStarted=false,nativeGameObserved=false;
    const stats={nativeSteps:0,nativeCasts:0,ownedHits:0,outgoingSequence:0,outgoingEvents:[],rejected:0,snapshots:0,transitions:0,nativeActorEntries:0,skippedSteps:{},rejectionReasons:{},inputAccepted:0,inputBySlot:Object.create(null),actorSteps:Object.create(null),contextRejected:{},faults:[]};
    const portrait=()=>env.matchMedia?.('(pointer:coarse)')?.matches===true&&num(env.innerHeight)>num(env.innerWidth);
    const status=()=>{if(nativeStarted&&binding()?.phase==='game')nativeGameObserved=true;const ended=room?.isHost===true&&nativeStarted&&nativeGameObserved&&binding()?.phase!=='game',nativePaused=currentRole==='host'&&(nativeStarted&&binding()?.phase!=='game'||native().paused?.()===true||!!binding()?.modal?.current||binding()?.blocked?.()===true),remotePaused=room?.isHost!==true&&(room?.hostPaused===true||room?.hostHidden===true);return {version:VERSION,ready:!!getParty()?.state,paused:currentRole==='disconnected'||room?.stale===true||remotePaused||nativePaused||portrait(),nativePaused,ended,nativeStarted,portrait:portrait(),role:currentRole,zone:getParty()?.state?.zone??null,epoch,autoMode:localAuto,slotId:room?.slotId??'p1',inActorTransaction:!!transaction};};
    const fault=(error,stage,slotId)=>{stats.faults.push({stage,slotId,message:String(error?.stack??error).slice(0,1200)});stats.faults=stats.faults.slice(-8);};
    const authority=()=>attached&&currentRole==='host'&&!status().paused;
    const authorityDiagnostic=()=>{const s=status(),b=binding();return {attached,role:currentRole,paused:s.paused,nativePaused:s.nativePaused,phase:b?.phase,nativeStarted,modal:!!b?.modal?.current,blocked:b?.blocked?.()===true,bridgePaused:native().paused?.()===true,stale:room?.stale===true,roomHost:room?.isHost===true,portrait:s.portrait,hidden:env.document?.hidden===true};};
    const rejected=(reason,detail)=>{stats.rejected++;stats.rejectionReasons[reason]=(stats.rejectionReasons[reason]??0)+1;stats.lastRejection={reason,...detail};return false;};
    const contextRejected=reason=>{stats.contextRejected[reason]=(stats.contextRejected[reason]??0)+1;stats.lastContextRejection={reason,...authorityDiagnostic()};return false;};
    function actorContext(world,actor) {
      let ctx=contexts.get(actor);
      if(ctx&&ctx.world===world&&ctx.hero===actor.heroId)return ctx;
      const defaults=native().createState?.()??{};
      for(const key of Object.keys(defaults))if(owned(key)&&!Object.hasOwn(actor,key))actor[key]=clone(defaults[key]);
      actor.cooldowns??={};actor.resonance??=0;actor.combo??=0;actor.basicAttackCount??=0;actor.lastAttack??=-2;actor.lastDodgeAt??=-99;
      actor.activeHeroId=actor.heroId;actor.rc222NativeActor=true;
      ctx={world,hero:actor.heroId,input:new Set(),auto:actor.rc222CombatMode??'manual',passives:null,shards:null,lastAttackHeld:false,zone:world.zone};
      const target={};
      ctx.view=new Proxy(target,{
        get(_,key){if(key==='rc222ActorSlot')return actor.slotId;if(key==='rc222CanonicalWorld')return world;if(key==='activeHeroId')return actor.heroId;if(ctx.clockRows&&Object.hasOwn(ctx.clockRows,key))return ctx.clockRows[key];return owned(key)?actor[key]:world[key];},
        set(_,key,value){if(key==='activeHeroId'){if(value!==actor.heroId)throw Error('Remote hero identity is fixed for this run');return true;}(owned(key)?actor:world)[key]=value;return true;},
        deleteProperty(_,key){return delete (owned(key)?actor:world)[key];},
        has(_,key){return key==='activeHeroId'||key in (owned(key)?actor:world);},
        ownKeys(){return [...new Set([...Reflect.ownKeys(world),...Reflect.ownKeys(actor).filter(owned),'activeHeroId'])];},
        getOwnPropertyDescriptor(_,key){if(key in (owned(key)?actor:world)||key==='activeHeroId')return {configurable:true,enumerable:true,writable:true,value:owned(key)?actor[key]:world[key]};}
      });
      contexts.set(actor,ctx);return ctx;
    }
    function tagOwners(world,actor,before) {
      for(const key of ['pendingStrikes','resonanceThreads','effects','hostileProjectiles','pendingSpawns'])for(const row of world[key]??[])if(row&&typeof row==='object'){
        const previous=key==='hostileProjectiles'?before.projectileAllegiances?.get(row):null,converted=!!previous&&(!previous.reflected&&row.reflected===true||!previous.friendly&&row.friendly===true);
        if(before[key]?.has(row)&&!converted)continue;
        if(!converted&&row.nativeActorRC222&&row.partySlotV31322)continue;
        const hostileOwner=(world.enemies??[]).some(e=>e.id===row.sourceId||e.id===row.ownerId),eligible=key==='pendingStrikes'||key==='resonanceThreads'||row.friendly||row.reflected||(!hostileOwner&&!row.hostile&&!row.enemyAttackV31323);
        if(eligible){row.partySlotV31322=actor.slotId;row.nativeActorRC222=true;if(converted){row.heroId=actor.heroId;row.sourceHeroId=actor.heroId;row.impactHeroIdV31315=actor.heroId;}else row.heroId??=actor.heroId;}
      }
      for(const key of ['pendingHits','impactQueue'])for(const row of world[key]??[])if(row&&!before[key]?.has(row)&&row.rootTargetRC220==='__host')row.rootTargetRC220=actor.slotId;
      const call=actor.supportCall;if(call){call.partySlotV31322=actor.slotId;call.nativeActorRC222=true;}
    }
    function withActor(world,actor,fn) {
      if(!authority())return contextRejected('authority');
      if(getParty()?.state!==world)return contextRejected('canonical-world-mismatch');
      if(!actor||!HEROES.includes(actor.heroId))return contextRejected('actor');
      const b=binding();if(!b?.state||!b.hero||!b.input||!b.settings||!b.actions)return contextRejected('binding');
      const buffs=env.__HAPIL_PARTY_BUFFS_V31322__;
      if(buffs&&buffs!==buffAdapter){const original=buffs;buffAdapter=Object.freeze({...buffs,providers:s=>original.providers(s?.rc222CanonicalWorld??s),power:(s,target,critical,source)=>original.power(s?.rc222CanonicalWorld??s,target,critical,source??(s?.rc222ActorSlot?{heroId:s.activeHeroId,partySlotV31322:s.rc222ActorSlot}:source))});env.__HAPIL_PARTY_BUFFS_V31322__=buffAdapter;}
      const ctx=actorContext(world,actor);
      const refs=['state','hero','input','settings','auto','passives','shards','partyIds'];
      const saved=refs.map(key=>[key,b[key],b[key]?.current]);
      const controller=controls(),heldReader=controller.hasHeldLogical,effectiveReader=controller.effective;
      const prior=transaction,before={};
      for(const key of ['pendingStrikes','resonanceThreads','effects','hostileProjectiles','pendingSpawns','pendingHits','impactQueue'])before[key]=new Set(world[key]??[]);
      before.projectileAllegiances=new Map((world.hostileProjectiles??[]).map(q=>[q,{reflected:q?.reflected===true,friendly:q?.friendly===true}]));
      transaction={world,actor,view:ctx.view};
      try {
        b.state.current=ctx.view;b.hero.current=actor.heroId;b.input.current=ctx.input;
        b.settings.current={...b.settings.current,combatMode:ctx.auto,autoCombat:ctx.auto==='full'};
        controller.hasHeldLogical=logical=>ctx.input.has(logical);controller.effective=()=>ctx.auto;
        if(b.auto)b.auto.current=ctx.auto==='full';
        if(b.passives){actor.rc222Passives??=clone(b.passives.current);b.passives.current=actor.rc222Passives;}
        if(b.shards){actor.rc222Shards??=b.shards.current;b.shards.current=actor.rc222Shards;}
        if(b.partyIds)b.partyIds.current=[actor.heroId,env.__HAPIL_POLICY_V31400__?.partner?.(actor.heroId)].filter(Boolean);
        return fn(ctx.view,ctx,b);
      } finally {
        tagOwners(world,actor,before);
        if(b.passives)actor.rc222Passives=b.passives.current;
        if(b.shards)actor.rc222Shards=b.shards.current;
        for(const [key,ref,value]of saved)if(ref)ref.current=value;
        controller.hasHeldLogical=heldReader;controller.effective=effectiveReader;
        transaction=prior;
        actor.skillReady=['Q','W','E'].map(k=>num(actor.cooldowns?.[k]));actor.ultimateReady=num(actor.cooldowns?.R);actor.dashReady=num(actor.cooldowns?.S);
      }
    }
    function normalizeInput(raw={}) {
      const names=Array.isArray(raw.actions)?raw.actions:Object.entries(raw.actions??{}).filter(([,v])=>v===true).map(([k])=>({skill:'q',skill1:'q',skill2:'w',skill3:'e',ultimate:'r'}[k]??k));
      return {seq:raw.seq,moveX:clamp(raw.moveX),moveY:clamp(raw.moveY),aimX:num(raw.aimX),aimY:num(raw.aimY),actions:[...new Set(names.filter(k=>ACTIONS.has(k)))],guardHeld:raw.guardHeld===true||names.includes('guard'),attackHeld:raw.attackHeld===true||names.includes('attack'),attackReleased:raw.attackReleased===true,combatMode:['manual','semi','full'].includes(raw.combatMode)?raw.combatMode:typeof raw.autoMode==='boolean'?(raw.autoMode?'full':'manual'):null};
    }
    function input(slotId,raw={}) {
      const receipt=stats.inputBySlot[slotId]??={received:0,accepted:0};receipt.received++;receipt.lastSeq=raw.seq;receipt.lastActions=Array.isArray(raw.actions)?[...raw.actions]:Object.keys(raw.actions??{});receipt.lastAt=env.performance?.now?.()??Date.now();
      if(!authority())return rejected('input-authority',{slotId,seq:raw.seq,authority:authorityDiagnostic()});
      if(!getParty()?.roster?.some(r=>r.slotId===slotId&&r.control==='remote'))return rejected('input-slot',{slotId,seq:raw.seq,roster:(getParty()?.roster??[]).map(r=>({slotId:r.slotId,control:r.control}))});
      if(!Number.isSafeInteger(raw.seq)||raw.seq<0)return rejected('input-sequence',{slotId,seq:raw.seq});
      const old=incoming.get(slotId);if(old&&raw.seq<=old.seq)return rejected('input-stale-sequence',{slotId,seq:raw.seq,previous:old.seq});
      const v=normalizeInput(raw);v.actions=[...new Set([...(old?.edges??[]),...v.actions])];v.edges=v.actions;v.received=(env.performance?.now?.()??Date.now());incoming.set(slotId,v);stats.inputAccepted++;receipt.accepted++;receipt.lastAcceptedSeq=raw.seq;return true;
    }
    function move(view,actor,wire,dt) {
      if(typeof native().moveActor==='function')return native().moveActor(view,actor,wire,dt);
      // A missing native movement bridge is a visible integration failure, never an alternate physics rule.
      if(Math.hypot(wire.moveX,wire.moveY)>.001)throw Error('RC222 native moveActor binding is missing');
      actor.moveVx=actor.moveVy=0;
    }
    function actorClock(view,ctx,delta){
      if(typeof native().actorClock!=='function')return delta;
      const clockRows={pendingStrikes:(ctx.world.pendingStrikes??[]).filter(q=>q.partySlotV31322===view.rc222ActorSlot),effects:(ctx.world.effects??[]).filter(q=>q.partySlotV31322===view.rc222ActorSlot)},rows=[...clockRows.pendingStrikes,...clockRows.effects],tags=rows.map(q=>[q,q.partySlotV31322]);
      const classes=env.document?.documentElement?.classList,flags=['rc51-samong','rc91-samong','rc51-time-stop'].map(k=>[k,classes?.contains?.(k)]);
      ctx.clockRows=clockRows;
      try{for(const [q]of tags)delete q.partySlotV31322;return native().actorClock(view,delta);}
      finally{for(const [q,slot]of tags)q.partySlotV31322=slot;ctx.clockRows=null;for(const [key,on]of flags)if(typeof on==='boolean')classes.toggle(key,on);}
    }
    function stepActor(world,actor,_legacyInput,dt,index,rawHeroDelta=dt,rawElapsed=rawHeroDelta) {
      if(!attached||actor?.control!=='remote')return false;
      stats.nativeActorEntries++;
      if(!authority()){const state=authorityDiagnostic(),reason=state.nativePaused?'native-paused':state.role!=='host'?'role':state.portrait?'portrait':'authority';stats.skippedSteps[reason]=(stats.skippedSteps[reason]??0)+1;stats.lastSkippedStep={slotId:actor.slotId,...state};return true;}
      const raw=incoming.get(actor.slotId),fresh=raw&&(env.performance?.now?.()??Date.now())-raw.received<800;
      const wire=fresh?{...raw,actions:[...raw.edges]}:{moveX:0,moveY:0,actions:[],attackHeld:false,guardHeld:false};
      if(raw)raw.edges=[];
      try {
        withActor(world,actor,(view,ctx,b)=>{
          const diagnostic=stats.actorSteps[actor.slotId]??={entries:0,basicAttempts:0,basicCommits:0};diagnostic.entries++;Object.assign(diagnostic,{seq:raw?.seq,fresh:!!fresh,attackHeld:wire.attackHeld===true,guardHeld:wire.guardHeld===true,actions:[...wire.actions],worldTime:world.time,dt,rawHeroDelta,rawElapsed,bindingPhase:b.phase,bindingWorldMatches:b.state.current===view,nativeInputBlocked:getParty()?.blocksNativeInput?.()===true,buffered:!!view.bufferedAction,hp:actor.hp});
          if(ctx.zone!==world.zone){ctx.zone=world.zone;ctx.input.clear();ctx.lastAttackHeld=false;env.__HAPIL_LOOP_V31365__?.cancelCharge(view,'map-transition');}
          if(wire.combatMode)ctx.auto=wire.combatMode;actor.rc222CombatMode=ctx.auto;b.settings.current.combatMode=ctx.auto;b.settings.current.autoCombat=ctx.auto==='full';if(b.auto)b.auto.current=ctx.auto==='full';
          view.combatModeV31329=ctx.auto;ctx.input.clear();
          if(wire.moveX<-.05)ctx.input.add('ArrowLeft');if(wire.moveX>.05)ctx.input.add('ArrowRight');if(wire.moveY<-.05)ctx.input.add('ArrowUp');if(wire.moveY>.05)ctx.input.add('ArrowDown');
          if(wire.attackHeld)ctx.input.add('KeyA');if(wire.guardHeld)ctx.input.add('KeyD');
          const actions=new Set(wire.actions),loop=env.__HAPIL_LOOP_V31365__,channel=env.__HAPIL_CHANNEL_V31364__,samong=env.__HAPIL_SAMONG_RC91__;
          if(!(actor.hp>0)){
            channel?.end(view,view,'down');loop?.cancelCharge(view,'down');
            if(actions.has('reviveSamong'))samong?.chooseRevival(view,'samong');
            if(actions.has('reviveCheckpoint'))native().reviveActor?.(view,actor,'checkpoint');
            if(!(actor.hp>0)&&num(actor.downUntil,Infinity)<=world.time&&(world.hp>0||(getParty()?.actors??[]).some(a=>a!==actor&&a.hp>0)))native().reviveActor?.(view,actor,'cooperative');
            return;
          }
          samong?.advance(view,Math.max(0,rawElapsed),false);
          const guarding=channel?.companion(view,view,wire.guardHeld)===true;
          actorClock(view,ctx,Math.max(0,rawHeroDelta));loop?.tick?.(view,dt);
          if(typeof native().actorFrame==='function')native().actorFrame(view,actor,dt,index,wire);
          if(!(actor.hp>0)){actor.downUntil=world.time+8;return;}
          if(guarding)return;
          move(view,actor,wire,Math.max(0,rawHeroDelta));
          if(actions.has('dash')){loop?.cancelCharge(view,'manual-blink');b.actions.dash();stats.nativeCasts++;}
          if(actions.has('resonance')||actions.has('time')){b.actions.resonance();stats.nativeCasts++;}
          if(actions.has('collab')){b.actions.collab();stats.nativeCasts++;}
          for(const [key,i]of [['q',0],['w',1],['e',2],['r',3]])if(actions.has(key)){b.actions.skill(i);stats.nativeCasts++;break;}
          const pressed=actions.has('chargeStart')||wire.attackHeld&&!ctx.lastAttackHeld;
          if(pressed){env.__HAPIL_SIMPLE_V31368__?.noteA(view);if(!loop?.pressA(view)&&ctx.auto==='manual')b.actions.attack();}
          if(actions.has('chargeRelease')||wire.attackReleased||!wire.attackHeld&&ctx.lastAttackHeld)loop?.releaseA(view);
          ctx.lastAttackHeld=wire.attackHeld;
          env.__HAPIL_SIMPLE_V31368__?.tick(view,rawHeroDelta);
          const beforeBasic=num(actor.basicAttackCount);diagnostic.basicAttempts++;diagnostic.basicResult=controls()?.tickBasic?.(view,rawHeroDelta,{...b,paused:false});diagnostic.basicCommits+=Math.max(0,num(actor.basicAttackCount)-beforeBasic);Object.assign(diagnostic,{mode:ctx.auto,basicAttackCount:actor.basicAttackCount,lastAttack:actor.lastAttack,manualUntil:view.manualControlUntilV31329,motion:actor.heroMotion?.kind,motionUntil:actor.heroMotion?.until,targetId:view.targetEnemyId,nearest:(world.enemies??[]).filter(a=>a.hp>0).map(a=>({id:a.id,distance:Math.hypot(a.x-actor.x,a.y-actor.y),invulnerableUntil:a.invulnerableUntil,phaseTransition:!!a.phaseTransitionActive,targetable:a.targetable})).sort((a,b)=>a.distance-b.distance).slice(0,1)});
          stats.nativeSteps++;
        });
      }catch(error){fault(error,'native-actor-step',actor.slotId);releaseInputs('native-actor-fault',actor.slotId);}
      return true;
    }
    function resolveOutgoing(world,source,callback) {
      if(!source?.nativeActorRC222||!source.partySlotV31322)return callback(world);
      if(transaction?.actor?.slotId===source.partySlotV31322)return callback(transaction.view);
      const actor=getParty()?.actors?.find(a=>a.slotId===source.partySlotV31322);
      if(!authority()||!actor||!(actor.hp>0)){stats.rejected++;return false;}
      return withActor(world,actor,view=>callback(view));
    }
    function ownOutgoingSource(source) {
      if(source?.nativeActorRC222&&source.partySlotV31322||!transaction)return source;
      return {...(source&&typeof source==='object'?source:{}),partySlotV31322:transaction.actor.slotId,nativeActorRC222:true,heroId:source?.heroId??transaction.actor.heroId};
    }
    function recordOutgoing(world,target,source,hpBefore) {
      const actor=transaction?.actor,canonical=world?.rc222CanonicalWorld??world;
      if(!actor||transaction.world!==canonical||getParty()?.state!==canonical||!source?.nativeActorRC222||source.partySlotV31322!==actor.slotId||!(canonical.enemies??[]).includes(target)||!Number.isFinite(hpBefore)||!Number.isFinite(target.hp)||!(hpBefore>target.hp))return false;
      const text=v=>typeof v==='string'||typeof v==='number'?String(v).slice(0,160):null;
      const event={seq:++stats.outgoingSequence,slotId:actor.slotId,heroId:actor.heroId,targetId:text(target.id),sourceId:text(source.id??source.attackInstanceIdV31336??source.sourceId??source.ownerId),damage:hpBefore-target.hp,hpBefore,hpAfter:target.hp,zone:canonical.zone,time:canonical.time};
      stats.ownedHits++;stats.outgoingEvents.push(event);if(stats.outgoingEvents.length>256)stats.outgoingEvents.shift();return true;
    }
    function ownsActor(world,actor){return attached&&getParty()?.state===world&&actor?.control==='remote'&&getParty()?.actors?.includes(actor);}
    function parryActor(world,q,actor,verified=true){if(!ownsActor(world,actor))return undefined;return withActor(world,actor,view=>{const hostSeen=q.coreContactsV31333?.includes('__host')===true,result=env.__HAPIL_CHANNEL_V31364__?.tryParry(view,q,view,verified)??false;if(result){q.parriedByV31356=actor.slotId;const contacts=q.coreContactsV31333??[];q.coreContactsV31333=[...new Set([...contacts.map(k=>!hostSeen&&k==='__host'?actor.slotId:k),actor.slotId])].slice(0,8);}return result;});}
    function blockActorDamage(world,actor,source,damage){if(!ownsActor(world,actor))return undefined;return withActor(world,actor,view=>env.__HAPIL_CHANNEL_V31364__?.blockDamage(view,view,source,damage)??false);}
    function incomingActor(world,actor,damage,source={}){
      if(!ownsActor(world,actor))return undefined;
      return withActor(world,actor,view=>{
        if(typeof native().incoming!=='function')throw Error('RC222 native incoming binding is missing');
        const alive=actor.hp>0,result=native().incoming(view,damage,source.originX??source.x??actor.x,source.originY??source.y??actor.y,source);
        if(result)native().applyStatus?.(view,source);
        if(alive&&!(actor.hp>0)){actor.downUntil=world.time+8;releaseInputs('down',actor.slotId);}
        return result;
      });
    }
    function releaseInputs(reason='release',slotId) {
      if(slotId)incoming.delete(slotId);else{incoming.clear();held.clear();inputEdges.length=0;}
      for(const actor of getParty()?.actors??[])if(!slotId||actor.slotId===slotId){const ctx=contexts.get(actor);if(ctx){ctx.input.clear();ctx.lastAttackHeld=false;env.__HAPIL_LOOP_V31365__?.cancelCharge(ctx.view,reason);env.__HAPIL_CHANNEL_V31364__?.end(ctx.view,ctx.view,reason);}actor.moveVx=actor.moveVy=0;}
      return true;
    }
    function captureLocal() {
      const p=getParty(),b=binding(),world=b?.state?.current??p?.state;return portable({world:world?clone(world):null,runDraft:env.__HAPIL_RUN_V31400__?.draft?.(),phase:b?.phase??'title',auto:b?.auto?.current,hero:b?.hero?.current,settings:clone(b?.settings?.current),passives:clone(b?.passives?.current),shards:b?.shards?.current,partyIds:clone(b?.partyIds?.current),roster:clone(p?.roster??[]),mode:p?.status?.mode??'solo',modeChoice:env.__HAPIL_PARTY_LAUNCH_V31322__?.getGameMode?.(),endingFlag:env.__HAPIL_ENDING_CLEARED_V31300__,records:native().captureRecords?.()});
    }
    function restoreLocal(saved) {
      if(!saved)return false;saved=portable(saved,true);const p=getParty(),b=binding();releaseInputs('leave');
      p?.leave?.();if(saved.runDraft)env.__HAPIL_RUN_V31400__?.select?.(saved.runDraft);const target=localWorldRef??b?.state?.current??p?.state;if(saved.world&&target){for(const key of Object.keys(target))delete target[key];Object.assign(target,clone(saved.world));if(b?.state)b.state.current=target;env.__HAPIL_RUN_V31400__?.init?.(target,saved.hero,saved.world.runPolicyV31400??saved.runDraft??{aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'new'});p?.capture?.(target,{damage:b?.actions?.damage,heroRef:b?.hero,cache:b?.cache?.current},saved.phase!=='game');}
      for(const key of ['hero','settings','passives','shards','partyIds','auto'])if(b?.[key]&&Object.hasOwn(saved,key))b[key].current=clone(saved[key]);
      env.__HAPIL_ENDING_CLEARED_V31300__=saved.endingFlag;if(saved.records!==undefined)native().restoreRecords?.(saved.records);
      if(saved.modeChoice!==undefined)env.__HAPIL_PARTY_LAUNCH_V31322__?.setGameMode?.(saved.modeChoice);
      if(saved.roster?.length)p?.configure?.({mode:saved.mode,roster:saved.roster});
      b?.actions?.restoreView?.(saved);
      if(saved.phase!=='game'){b?.actions?.returnTitle?.();if(b)b.phase=saved.phase??'title';}
      return true;
    }
    function connectStorage() {
      const s=env.__HAPIL_COOP_STORAGE_RC222__;if(s?.configure)s.configure({captureLocal,restoreLocal,captureCheckpoint:()=>exportSnapshot({full:true}),applyCheckpoint:snap=>snapshot(snap,{seq:wireSeq+1,epoch,full:true,transition:true,allowHost:true}),validateCheckpoint});
      return s;
    }
    function role(next) {if(!['host','guest','disconnected','offline'].includes(next))return false;if(next!==currentRole)releaseInputs('role-change');currentRole=next;getParty()?.setNetworkRole?.(next==='offline'?'local':next);return status();}
    function configureRoster(next,preserveStory=false) {
      if(!Array.isArray(next.roster)||!next.roster.length)return;
      const rows=next.roster.map((r,i)=>({slotId:r.slotId??'p'+(i+1),heroId:r.heroId,name:r.nickname??r.name??r.heroId,control:i===0?'host':r.kind==='ai'?'ai':r.kind==='local'&&next.isHost?'local':'remote'}));
      const signature=JSON.stringify(rows);if(signature!==rosterSignature&&getParty()){
        // Checkpoints own actor state; the connected room owns human identities.
        // A native story companion can accompany those humans outside the four room slots.
        const story=preserveStory?getParty().roster?.find(r=>r.slotId==='story68'&&r.control==='ai'):null;
        const configured=story&&rows.length<8&&!rows.some(r=>r.slotId===story.slotId||r.heroId===story.heroId)?[...rows,{...story}]:rows;
        getParty().configure({mode:'network',roster:configured});rosterSignature=signature;
      }
    }
    function updateRoom(next={}) {const oldEpoch=epoch;room={...(room??{}),...next};if(Number.isSafeInteger(next.epoch)&&next.epoch>=epoch)epoch=next.epoch;if(oldEpoch!==epoch){wireSeq=-1;releaseInputs('epoch');stats.transitions++;}if(attached)configureRoster(room);return status();}
    function attach(next={}) {
      if(!attached){localWorldRef=binding()?.state?.current??getParty()?.state??null;capture=captureLocal();localAuto=controls()?.choice?.(binding()?.settings?.current)??'manual';const result=connectStorage()?.enter?.(next.isHost?'host':'guest',next.session??next);if(result?.ok===false)throw Error('Cooperative storage isolation failed: '+result.reason);native().reloadRecordScopes?.();attached=true;}
      updateRoom(next);role(next.isHost?'host':'guest');return status();
    }
    async function start(next=room??{}) {
      if(!attached)attach(next);else updateRoom(next);
      const p=getParty();if(!p)throw Error('Native party is not ready');
      role(next.isHost?'host':'guest');
      if(next.isHost&&next.mode)env.__HAPIL_PARTY_LAUNCH_V31322__?.setGameMode?.(next.mode);
      configureRoster(next);
      if(binding()?.phase!=='game')await p.startGame?.();
      // Native launch replaces the React world and configures its run roster.
      // Bind that replacement before publishing the initial authoritative frame.
      const current=binding();if(current?.state?.current&&p.state!==current.state.current)p.capture?.(current.state.current,{damage:current.actions?.damage,heroRef:current.hero,cache:current.cache?.current},currentRole!=='host');
      rosterSignature='';configureRoster(next);
      nativeStarted=true;if(binding()?.phase==='game')nativeGameObserved=true;
      return status();
    }
    function validateCheckpoint(snap) {
      if(!(snap&&snap.protocol===1&&Number.isSafeInteger(snap.seq)&&typeof snap.zone==='string'&&Array.isArray(snap.world?.fields)&&snap.world.fields.length<=2048&&Array.isArray(snap.party?.roster)&&snap.party.roster.length>=1&&snap.party.roster.length<=8&&Array.isArray(snap.party?.actors)&&snap.party.actors.length===snap.party.roster.length-1))return false;
      const fields={},keys=new Set();for(const row of snap.world.fields){if(!Array.isArray(row)||row.length!==2||typeof row[0]!=='string'||['__proto__','constructor','prototype'].includes(row[0])||keys.has(row[0]))return false;keys.add(row[0]);fields[row[0]]=row[1];}
      if(fields.zone!==snap.zone||![fields.time,fields.x,fields.y,fields.hp,fields.maxHp].every(Number.isFinite)||fields.maxHp<=0||fields.hp<0||fields.hp>fields.maxHp)return false;
      if(!['enemies','effects','hostileProjectiles','pendingHits','impactQueue','floatTexts','egoDrops','defeated','pendingStrikes','resonanceThreads','telekineticCasts'].every(k=>Array.isArray(fields[k])))return false;
      if(![fields.clues,fields.spawnedWaves].every(s=>s&&Array.isArray(s.$hapilSet)))return false;
      const seen=new Set();for(const row of snap.party.roster){if(!row||typeof row.slotId!=='string'||!row.slotId||seen.has(row.slotId)||!HEROES.includes(row.heroId))return false;seen.add(row.slotId);}
      for(const [i,a]of snap.party.actors.entries()){const r=snap.party.roster[i+1];if(!a||a.slotId!==r.slotId||a.heroId!==r.heroId||![a.x,a.y,a.hp,a.maxHp].every(Number.isFinite)||a.maxHp<=0||a.hp<0||a.hp>a.maxHp)return false;}
      return native().validateSnapshot?native().validateSnapshot(snap)===true:true;
    }
    function exportSnapshot(options={}) {
      if(!attached||!room?.isHost||currentRole==='guest')return null;const p=getParty(),snap=p?.exportSnapshot?.();if(!snap)return null;
      if(hostZone!==null&&hostZone!==snap.zone){releaseInputs('zone');stats.transitions++;}hostZone=snap.zone;
      const card=env.document?.getElementById?.('hapil-story-rc51'),story=card?{zone:card.dataset.zone,phase:card.dataset.phase,title:card.querySelector?.('h1')?.textContent??'',paragraphs:[...(card.querySelectorAll?.('.rc51-copy p')??[])].map(p=>p.textContent)}:null;
      snap.rc222={version:1,epoch,full:options.full!==false,zone:snap.zone,actorModes:(p.actors??[]).map(a=>({slotId:a.slotId,combatMode:contexts.get(a)?.auto??'manual'})),narrative:story,checkpointBoundary:{privateActions:'clear-on-host-load',remainingDamageSaved:false}};
      return snap;
    }
    function snapshot(snap,meta={}) {
      if(!attached||currentRole==='host'&&!meta.allowHost||!validateCheckpoint(snap)){stats.rejected++;return false;}
      const nextEpoch=Number.isSafeInteger(meta.epoch)?meta.epoch:epoch,seq=Number.isSafeInteger(meta.seq)?meta.seq:snap.seq;
      if(nextEpoch<epoch||nextEpoch===epoch&&seq<=wireSeq&&!(meta.resync===true&&meta.full===true)||nextEpoch>epoch&&!meta.full){stats.rejected++;return false;}
      if(!getParty()?.state){stats.rejected++;return false;}
      const p=getParty(),savedRole=currentRole,beforePositions=positions();role('guest');
      const candidate={...snap,seq:Math.max(nativeSeq,num(p.status?.snapshotSeq))+1};
      let accepted=false;
      try{accepted=p.applySnapshot(candidate)!==false;}finally{if(meta.allowHost)role(savedRole);}
      if(!accepted){stats.rejected++;return false;}
      if(meta.allowHost){
        // Native applySnapshot restores its saved roster too. Reconfigure even when
        // room membership has not changed since the last ordinary room update.
        rosterSignature='';configureRoster(room,true);
        releaseInputs('checkpoint-load');controls()?.clear?.('checkpoint-load');native().resetPlayerTransient?.(p.state);for(const actor of p.actors??[])native().resetPlayerTransient?.(actorContext(p.state,actor).view);
      }
      nativeSeq=candidate.seq;wireSeq=seq;
      const transition=nextEpoch!==epoch||meta.transition||hostZone!==snap.zone;
      if(transition){releaseInputs('snapshot-transition');interpolation=[];stats.transitions++;}
      else if(!meta.allowHost&&currentRole==='guest'){
        const started=env.performance?.now?.()??Date.now();interpolation=[];
        for(const [key,row]of positions()){const from=beforePositions.get(key);if(!from||Math.hypot(row.x-from.x,row.y-from.y)>10)continue;interpolation.push({row:row.object,x:from.x,y:from.y,tx:row.x,ty:row.y,started});row.object.x=from.x;row.object.y=from.y;}
      }
      epoch=nextEpoch;hostZone=snap.zone;narrative=snap.rc222?.narrative??null;mirrorNarrative();stats.snapshots++;return true;
    }
    function positions(){const p=getParty(),s=p?.state,out=new Map();if(!s)return out;const add=(key,a)=>{if(a&&Number.isFinite(a.x)&&Number.isFinite(a.y))out.set(key,{object:a,x:a.x,y:a.y});};add('host',s);for(const a of p.actors??[])add('actor:'+a.slotId,a);for(const a of s.enemies??[])add('enemy:'+a.id,a);for(const a of s.hostileProjectiles??[])add('projectile:'+a.id+':'+a.born,a);return out;}
    function interpolate(){if(currentRole!=='guest')return;const at=env.performance?.now?.()??Date.now();for(const q of interpolation){const u=Math.max(0,Math.min(1,(at-q.started)/100));q.row.x=q.x+(q.tx-q.x)*u;q.row.y=q.y+(q.ty-q.y)*u;}interpolation=interpolation.filter(q=>at-q.started<100);}
    function mirrorNarrative(){
      const doc=env.document;if(!doc?.createElement||room?.isHost)return;
      const valid=narrative&&narrative.zone===getParty()?.state?.zone&&typeof narrative.title==='string'&&Array.isArray(narrative.paragraphs)&&narrative.paragraphs.length<=128&&narrative.paragraphs.every(p=>typeof p==='string'&&p.length<=20000),key=valid?JSON.stringify(narrative):'';
      if(key===narrativeKey)return;narrativeKey=key;doc.getElementById?.('hapil-remote-narrative-rc222')?.remove();if(!valid)return;
      const node=(tag,cls,text)=>{const el=doc.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
      const card=node('div','rc51-story'),panel=node('section','rc51-panel'),head=node('header','rc51-header'),title=node('h1','',narrative.title),box=node('div','rc51-copybox'),copy=node('article','rc51-copy');
      card.id='hapil-remote-narrative-rc222';card.setAttribute('role','dialog');card.setAttribute('aria-label',narrative.title);for(const p of narrative.paragraphs)copy.append(node('p','',p));head.append(title);box.append(copy);panel.append(head,box);card.append(panel);doc.body.append(card);
    }
    function leave() {
      releaseInputs('leave');const storage=connectStorage();try{const result=storage?.leave?storage.leave():restoreLocal(capture);if(result===false||result?.ok===false)throw Error('Local state restore failed: '+(result?.reason??'runtime-restore'));}catch(error){role('disconnected');throw error;}
      attached=false;capture=null;room=null;epoch=0;wireSeq=-1;hostZone=null;rosterSignature='';currentRole='offline';narrative=null;narrativeKey='';localWorldRef=null;nativeStarted=false;nativeGameObserved=false;interpolation=[];env.document?.getElementById?.('hapil-remote-narrative-rc222')?.remove();return status();
    }
    function readInput() {
      if(portrait())releaseInputs('portrait');
      const moveX=(held.has('ArrowRight')?1:0)-(held.has('ArrowLeft')?1:0),moveY=(held.has('ArrowDown')?1:0)-(held.has('ArrowUp')?1:0),edges=inputEdges.splice(0),attack=held.has('KeyA'),guard=held.has('KeyD');
      if(status().paused)return {seq:++inputSeq,moveX:0,moveY:0,actions:[],autoMode:localAuto==='full',combatMode:localAuto};
      return {seq:++inputSeq,moveX,moveY,actions:[...new Set([...edges,...(attack?['attack']:[]),...(guard?['guard']:[])])],attackHeld:attack,guardHeld:guard,combatMode:localAuto,autoMode:localAuto==='full'};
    }
    function requestRevive(choice='samong') {const actor=getParty()?.actors?.find(a=>a.slotId===room?.slotId);if(choice!=='samong'||!attached||room?.isHost||currentRole!=='guest'||status().paused||!actor||actor.hp>0||!['DREAM'].includes(room?.mode??getParty()?.state?.gameModeV31346))return false;if(!inputEdges.includes('reviveSamong'))inputEdges.push('reviveSamong');return true;}
    function hostStatus(value={}) {return updateRoom({hostHidden:value.hidden===true,hostPaused:value.paused===true});}
    function setAutoMode(mode) {if(!['manual','semi','full'].includes(mode))return false;localAuto=mode;return mode;}
    const api={version:VERSION,attach,updateRoom,start,input,snapshot,exportSnapshot,status,releaseInputs,role,leave,readInput,stepActor,resolveOutgoing,ownOutgoingSource,recordOutgoing,withActor,tagOwners,captureLocal,restoreLocal,validateCheckpoint,setAutoMode,requestRevive,hostStatus,normalizeInput,ownsActor,parryActor,blockActorDamage,incomingActor,
      passiveFrame:()=>attached&&(currentRole==='guest'||currentRole==='disconnected'),guestFrame:()=>{if(attached&&currentRole==='guest'){interpolate();mirrorNarrative();}return attached&&(currentRole==='guest'||currentRole==='disconnected');},
      canonicalWorld:s=>s?.rc222CanonicalWorld??s,actorFor:s=>s?.rc222ActorSlot?getParty()?.actors?.find(a=>a.slotId===s.rc222ActorSlot):null,get inActorTransaction(){return !!transaction;},get activeActor(){return transaction?.actor??null;},get session(){return room;},telemetry:()=>clone(stats),debug:{actorContext,owned,clone,incoming,held}};
    const physical={KeyA:'attack',KeyS:'dash',Space:'dash',KeyD:'guard',KeyQ:'q',KeyW:'w',KeyE:'e',KeyR:'r',Digit1:'resonance',Digit2:'collab'};
    function keyEvent(event,down){
      if(!attached||room?.isHost||!['guest','disconnected'].includes(currentRole))return;
      if(env.__HAPIL_REMOTE_UI_RC222__?.isOpen?.()){releaseInputs('lobby');return;}
      if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]')){releaseInputs('text-focus');return;}
      if(event.code==='Escape'){releaseInputs('escape');return;}
      if(!physical[event.code]&&!/^Arrow(?:Up|Down|Left|Right)$/.test(event.code))return;
      event.preventDefault?.();event.stopImmediatePropagation?.();
      if(status().paused){releaseInputs('paused');return;}
      if(down){if(!held.has(event.code)&&!event.repeat){held.add(event.code);if(physical[event.code]&&!['attack','guard'].includes(physical[event.code]))inputEdges.push(physical[event.code]);if(event.code==='KeyA')inputEdges.push('chargeStart');}}
      else {held.delete(event.code);if(event.code==='KeyA')inputEdges.push('chargeRelease');}
    }
    api.virtualKey=(code,down)=>{keyEvent({code,repeat:false,preventDefault(){},stopImmediatePropagation(){}},down===true);return true;};
    env.addEventListener?.('keydown',e=>keyEvent(e,true),true);env.addEventListener?.('keyup',e=>keyEvent(e,false),true);
    env.addEventListener?.('blur',()=>releaseInputs('blur'));env.document?.addEventListener?.('visibilitychange',()=>{if(env.document.hidden)releaseInputs('hidden');});
    return api;
  }
  const runtime=createRuntime(root);root.__HAPIL_REMOTE_RC222_RUNTIME__=runtime;
  if(typeof module!=='undefined'&&module.exports)module.exports={createRuntime,owned,clone,portable,HEROES};
})(typeof window!=='undefined'?window:globalThis);
