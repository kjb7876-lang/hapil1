/* RC115: guarded full-auto clear timer. Native gates/interludes stay authoritative. */
(()=>{'use strict';
 const timers=new WeakMap(),C=()=>window.__HAPIL_CONTROLS_V31329__,A=()=>window.__HAPIL_AUTOPROGRESS_V31301__,F=()=>window.__HAPIL_FLOW_V31343__;
 const now=()=>performance.now(),AUTO_MS=7000;
 function reset(s){if(s&&typeof s==='object')timers.delete(s);}
 function step(s,settings,blocked,interact){
  if(!s||typeof s!=='object')return false;
  const mode=C()?.effective?.(settings)??settings?.combatMode;
  const eligible=!blocked&&!document.hidden&&s.hp>0&&mode==='full'&&settings?.autoPortal!==false&&settings?.autoCombat!==false&&
   s.practiceV31329!==true&&!s.paused&&!s.dead&&!s.dying&&s.deathState!=='dying'&&!F()?.blocked?.(s,blocked)&&
   !window.__HAPIL_PARTY_V31322__?.blocksNativeInput?.()&&!window.__HAPIL_CHANNEL_V31364__?.active?.(s)&&
   !window.__HAPIL_STORY_RC51__?.isOpen?.()&&!(s.target&&s.target.autoProgressV31301!==true);
  if(!eligible){reset(s);return false;}
  const flow=F(),profile=flow?.profile?.(s.zone),plan=A()?.plan?.(s,{...settings,combatMode:'full',autoCombat:true,autoPortal:true},false);
  let ready=false;
  if(profile){ready=flow.ready(s,false)?.ready===true&&plan?.reason==='combat-exit-portal'&&['move','interact'].includes(plan.action);}
  else ready=plan?.reason==='combat-exit-portal'&&['move','interact'].includes(plan.action);
  if(!ready){reset(s);return false;}
  const t=now(),previous=timers.get(s);
  if(!previous||previous.zone!==s.zone||s.time<previous.simTime||t-previous.at>1800){timers.set(s,{zone:s.zone,simTime:s.time,at:t,started:t,attemptAt:0});return false;}
  previous.simTime=s.time;previous.at=t;
  if(t-previous.started<AUTO_MS){if(previous.started===undefined)previous.started=t;return false;}
  if(previous.attemptAt&&t-previous.attemptAt<900)return true;
  if(typeof interact!=='function'){reset(s);return false;}
  previous.attemptAt=t;
  if(profile){const started=flow.transition(s,()=>interact(true),false,true);if(started)previous.transitionStarted=true;return true;}
  interact(true);return true;
 }
 window.__HAPIL_AUTO_MAP_ADVANCE_RC115__=Object.freeze({version:'RC115',step,reset,metrics:()=>({tracked:'weak-map',delayMs:AUTO_MS})});
})();
