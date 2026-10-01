/* HAPIL 3.14.06: shared input scope and action priority contract.
 * No damage, healing, movement, cooldown or rendering mutation occurs here.
 * Tokens identify an action transaction, not a key or a persistent save value. */
(function(root){'use strict';
 if(root.__HAPIL_ACTION_CONTRACT_V31406__)return;
 const counters={scopes:0,invalidScopes:0,acceptedGates:0,rejectedGates:0};let serial=0;
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function capture(binding){const s=binding?.state?.current;if(!s||typeof s!=='object')return null;counters.scopes++;
  return {s,input:binding?.input?.current,zone:s.zone,hero:s.activeHeroId,at:Number(s.time)};
 }
 function same(a,b){return !!a&&!!b&&a.s===b.s&&a.input===b.input&&a.zone===b.zone&&a.hero===b.hero&&finite(a.at)&&finite(b.at)&&b.at>=a.at-1e-8;}
 function current(scope,binding,advance=false){const s=binding?.state?.current,at=Number(s?.time);const valid=!!scope&&!!s&&scope.s===s&&scope.input===binding?.input?.current&&scope.zone===s.zone&&scope.hero===s.activeHeroId&&finite(scope.at)&&finite(at)&&at>=scope.at-1e-8;if(!valid){counters.invalidScopes++;return false;}if(advance)scope.at=at;return true;}
 function forActor(s,a,binding){return a===s&&binding?.state?.current===s?capture(binding):null;}
 function token(){return ++serial;}
 function matchesToken(actual,expected){return expected===undefined||actual===expected;}
 function decide(kind,facts={}){
  let reason=null;
  if(facts.blocked)reason='blocked';
  else if(kind==='CHARGE_START')reason=!facts.awake?'not-awake':facts.defending?'guard':null;
  else if(kind==='GUARD_START')reason=facts.awake?'awake':facts.latched?'latched':facts.active?'active':facts.statusLocked?'status':facts.cooldownReady===false?'cooldown':null;
  else if(kind==='MANUAL_BLINK')reason=facts.defending?'guard':facts.statusLocked?'status':facts.cooldownReady===false?'cooldown':null;
  else if(kind==='AUTO_SKILL')reason=facts.defending?'guard':facts.timeStopped?'time-stop':facts.statusLocked?'status':null;
  else if(kind!=='GUARD_KEEP'&&kind!=='CHARGE_RELEASE')reason='unknown-action';
  const allowed=reason===null;allowed?counters.acceptedGates++:counters.rejectedGates++;
  return {allowed,reason,cancelCharge:allowed&&kind==='MANUAL_BLINK'&&!!facts.charging};
 }
 function describe(scope){return scope?{zone:String(scope.zone??''),hero:String(scope.hero??''),at:finite(scope.at)?scope.at:null}:null;}
 root.__HAPIL_ACTION_CONTRACT_V31406__=Object.freeze({installed:true,version:'3.14.06-RC1',capture,same,current,forActor,token,matchesToken,decide,describe,metrics:()=>({...counters})});
})(window);
