/* RC223: finite left-floor exposure, composed with existing native geometry.
 * The module deliberately owns no actor stats, timers on serialized state, or
 * damage reducer. The caller supplies the live native admission and damage
 * paths; exposure clocks live in WeakMaps keyed by the actual actor objects.
 */
(function(root){
  'use strict';

  const POLICY=Object.freeze({
    centerX:19,
    clearance:.8,
    graceSeconds:1,
    intervalSeconds:1,
    rawDamageFraction:.005,
    outgoingMultiplier:.9,
    movementMultiplier:.9,
    maxFrameDelta:.25,
    warningText:'위험 지대 · 체력과 전투력이 감소합니다',
    warningSeconds:.8
  });
  const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const pointOk=p=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.y);

  function createController(deps={}){
    const clocks=new WeakMap(),actorsByWorld=new WeakMap();
    const metrics={entries:0,exits:0,tickAttempts:0,damageApplied:0,duplicateFrames:0,authoritySkips:0};
    let damageEventSerial=0;

    const inScope=s=>typeof deps.inScope==='function'&&deps.inScope(s)===true;
    const authoritative=(s,a)=>typeof deps.isHost==='function'&&deps.isHost(s,a)===true;
    const isPlayer=(s,a)=>typeof deps.isPlayer==='function'?deps.isPlayer(s,a)===true:(a===s||a?.rc222NativeActor===true);
    const prior=(s,a,p,r)=>typeof deps.originalAllowed==='function'&&deps.originalAllowed(s,a,p,r)===true;
    const physical=(s,p,r)=>typeof deps.nativeAll==='function'&&deps.nativeAll(s,p,r)===true;
    function oldAllowed(s,a,p,r=POLICY.clearance){return prior(s,a,p,r);}
    function opened(s,p,r=POLICY.clearance){return pointOk(p)&&p.x<POLICY.centerX&&physical(s,p,r);}
    function eligible(s,a){return !!s&&!!a&&inScope(s)&&isPlayer(s,a);}
    // A guest may inspect its own position and show the same warning as the
    // host. This geometric read is presentation-only; it never grants host
    // admission, stats, damage, or an exposure clock.
    function regionAt(s,a,p,r=POLICY.clearance){
      return eligible(s,a)&&opened(s,p,r)&&!oldAllowed(s,a,p,r);
    }

    // Extend the old admitted set by precisely native-all-floor points at
    // world x < 19. Integrators retain unrelated constraints (for example
    // native actor separation) around this predicate.
    function allowed(s,a,p,r=POLICY.clearance){
      if(!eligible(s,a))return false;
      return oldAllowed(s,a,p,r)||opened(s,p,r);
    }
    // Native input may enter the added floor only on the authoritative host.
    // `allowed` remains geometric so replicated actor coordinates on guests
    // are not snapped back across the old phase-side boundary.
    function canMove(s,a,p,r=POLICY.clearance){
      if(!eligible(s,a))return false;
      return oldAllowed(s,a,p,r)||authoritative(s,a)&&opened(s,p,r);
    }
    function exposedAt(s,a,p,r=POLICY.clearance){
      return authoritative(s,a)&&eligible(s,a)&&a.hp>0&&regionAt(s,a,p,r);
    }
    function exposed(s,a,p){return exposedAt(s,a,p??{x:a?.x,y:a?.y},POLICY.clearance);}

    function remember(s,a){
      let clock=clocks.get(a);
      if(clock?.state===s&&clock.zone===s.zone)return clock;
      if(clock)reset(clock.state,a);
      clock={state:s,zone:s.zone,elapsed:0,nextDamageAt:POLICY.graceSeconds+POLICY.intervalSeconds,
        ticks:0,appliedTicks:0,lastRawDamage:0,lastDamageAt:null,lastFrameKey:null,
        lastWorldTime:finite(s.time),enteredAt:finite(s.time),warningAt:finite(s.time)};
      clocks.set(a,clock);
      let rows=actorsByWorld.get(s);if(!rows){rows=new Set();actorsByWorld.set(s,rows);}rows.add(a);
      metrics.entries++;
      try{deps.onWarning?.(s,a,{text:POLICY.warningText,duration:POLICY.warningSeconds,at:finite(s.time)});}catch(error){
        // A presentation failure must not interrupt the native actor frame.
        try{deps.onWarningError?.(error,s,a);}catch{}
      }
      return clock;
    }
    function reset(state,actor){
      if(actor){
        const clock=clocks.get(actor);
        if(!clock||(state&&clock.state!==state))return false;
        clocks.delete(actor);actorsByWorld.get(clock.state)?.delete(actor);metrics.exits++;return true;
      }
      if(state){const rows=actorsByWorld.get(state);if(!rows)return false;for(const a of rows)clocks.delete(a);const removed=rows.size;rows.clear();metrics.exits+=removed;return removed>0;}
      return false;
    }
    function neutral(){return Object.freeze({active:false,exposed:false,outgoing:1,movement:1,status:'clear'});}
    function factors(s,a){
      if(!eligible(s,a)||!authoritative(s,a)){if(clocks.has(a))reset(undefined,a);return neutral();}
      if(!(a.hp>0)){if(clocks.has(a))reset(undefined,a);return neutral();}
      const inDanger=exposed(s,a);
      if(!inDanger){if(clocks.has(a))reset(undefined,a);return neutral();}
      return Object.freeze({active:true,exposed:true,outgoing:POLICY.outgoingMultiplier,movement:POLICY.movementMultiplier,status:'left-zone'});
    }
    function readout(s,a){
      const live=exposed(s,a)&&a.hp>0,clock=clocks.get(a),valid=live&&clock?.state===s&&clock.zone===s.zone;
      if(!live&&clock)reset(undefined,a);
      return Object.freeze({
        version:'RC223',zone:s?.zone??null,actorId:String(a?.slotId??a?.id??(a===s?'__host':'actor')).slice(0,120),
        owner:authoritative(s,a)?'host':'none',inRegion:regionAt(s,a,{x:a?.x,y:a?.y}),exposed:live,active:live,
        elapsedSeconds:valid?clock.elapsed:0,
        graceRemainingSeconds:valid?Math.max(0,POLICY.graceSeconds-clock.elapsed):0,
        nextDamageSeconds:valid?Math.max(0,clock.nextDamageAt-clock.elapsed):POLICY.graceSeconds+POLICY.intervalSeconds,
        ticks:valid?clock.ticks:0,appliedTicks:valid?clock.appliedTicks:0,
        lastRawDamage:valid?clock.lastRawDamage:0,lastDamageAt:valid?clock.lastDamageAt:null,
        outgoingMultiplier:live&&authoritative(s,a)?POLICY.outgoingMultiplier:1,
        movementMultiplier:live&&authoritative(s,a)?POLICY.movementMultiplier:1,
        warning:live?POLICY.warningText:null
      });
    }
    function tick(s,a,dt,frameKey){
      if(!s||!a)return Object.freeze({active:false,reason:'actor-missing'});
      // A remote ally remains a live player when the canonical host actor is
      // down. Only the actor being processed owns this exposure clock/health.
      if(!eligible(s,a)||!authoritative(s,a)||!(a.hp>0)||(a===s&&!(s.hp>0))){
        if(!authoritative(s,a))metrics.authoritySkips++;
        reset(undefined,a);return Object.freeze({active:false,reason:'inactive-or-nonauthoritative'});
      }
      if(s.paused===true||s.pause===true||finite(s.timeStopUntil)>finite(s.time)||
        typeof deps.isPaused==='function'&&deps.isPaused(s,a)===true)
        return readout(s,a);
      if(!exposed(s,a)){
        reset(undefined,a);
        return Object.freeze({active:false,reason:'clear'});
      }
      let clock=clocks.get(a);
      if(clock?.state===s&&clock.zone===s.zone&&finite(s.time)<clock.lastWorldTime-1e-9){
        reset(undefined,a);clock=null;
      }
      clock=clock??remember(s,a);
      const key=frameKey??(Number.isFinite(Number(s.time))?Number(s.time):null);
      if(key===null){return Object.freeze({active:true,reason:'frame-key-missing',...readout(s,a)});}
      if(Object.is(key,clock.lastFrameKey)){metrics.duplicateFrames++;return Object.freeze({active:true,duplicate:true,...readout(s,a)});}
      clock.lastFrameKey=key;
      clock.elapsed+=Math.max(0,Math.min(POLICY.maxFrameDelta,finite(dt)));
      clock.lastWorldTime=finite(s.time,clock.lastWorldTime);
      let due=false,rawDamage=0,applied=false;
      if(clock.elapsed+1e-9>=clock.nextDamageAt){
        rawDamage=Math.max(0,finite(a.maxHp)*POLICY.rawDamageFraction);
        const sequence=clock.ticks+1,eventSerial=++damageEventSerial;
        const source={id:`rc223-left-zone-${String(a.slotId??a.id??'actor').slice(0,80)}-${eventSerial}`,
          sourceId:'rc223-left-zone',kind:'left-zone',leftZoneRC223:true,status:'none',statusValue:0,
          rawDamageRC223:rawDamage,eventSerialRC223:eventSerial,boss:false,midboss:false};
        // Native incoming code owns mitigation, health commits and down/revive.
        if(typeof deps.applyDamage!=='function')return Object.freeze({active:true,reason:'native-damage-unavailable',...readout(s,a)});
        const result=deps.applyDamage(s,a,rawDamage,source);
        due=true;clock.ticks++;clock.lastRawDamage=rawDamage;clock.lastDamageAt=finite(s.time);
        clock.nextDamageAt+=POLICY.intervalSeconds;metrics.tickAttempts++;
        applied=result!==false;if(applied){clock.appliedTicks++;metrics.damageApplied++;}
        if(!(a.hp>0))reset(undefined,a);
      }
      return Object.freeze({active:true,due,rawDamage,applied,...readout(s,a)});
    }
    function snapshot(s,a){return a?readout(s,a):Object.freeze([...((actorsByWorld.get(s))??[])].map(actor=>readout(s,actor)));}
    return Object.freeze({version:'RC223',policy:POLICY,oldAllowed,opened,allowed,canMove,regionAt,exposedAt,exposed,factors,tick,reset,snapshot,
      metrics:()=>Object.freeze({...metrics})});
  }

  const api=Object.freeze({version:'RC223',policy:POLICY,createController});
  root.__HAPIL_LEFT_ZONE_RC223__=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
