/* RC122: approach the native exit; a timeout repairs only auto-owned navigation.
 * Never bypass distance, combat/objective gates, saving, or native interludes. */
(()=>{'use strict';
 const timers=new WeakMap(),C=()=>window.__HAPIL_CONTROLS_V31329__,A=()=>window.__HAPIL_AUTOPROGRESS_V31301__,F=()=>window.__HAPIL_FLOW_V31343__;
 const AUTO_MS=7000,STALL_MS=1800,RETRY_MS=2500,stats={repaths:0,nearInteractions:0};
 function reset(s){if(s&&typeof s==='object')timers.delete(s);}
 function step(s,settings,blocked,interact){
  if(!s||typeof s!=='object')return false;
  const mode=C()?.effective?.(settings)??settings?.combatMode,keys=C()?.binding?.input?.current;
  const manualKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys?.has?.(k));
  const eligible=!blocked&&!document.hidden&&s.hp>0&&mode==='full'&&settings?.autoPortal!==false&&settings?.autoCombat!==false&&
   s.practiceV31329!==true&&!s.paused&&!s.dead&&!s.dying&&s.deathState!=='dying'&&!F()?.blocked?.(s,blocked)&&
   !window.__HAPIL_PARTY_V31322__?.blocksNativeInput?.()&&!window.__HAPIL_CHANNEL_V31364__?.active?.(s)&&
   !window.__HAPIL_STORY_RC51__?.isOpen?.()&&!manualKeys&&!window.__HAPIL_MOVEMENT_V31336__?.active?.(s,s)&&
   !(Number(s.manualMovementUntil31222)>s.time)&&!(s.target&&s.target.autoProgressV31301!==true);
  if(!eligible){reset(s);return false;}
  const flow=F(),profile=flow?.profile?.(s.zone),plan=A()?.plan?.(s,{...settings,combatMode:'full',autoCombat:true,autoPortal:true},false);
  const ready=(!profile||flow.ready(s,false)?.ready===true)&&plan?.reason==='combat-exit-portal'&&['move','interact'].includes(plan.action);
  const target=plan?.target;
  if(!ready||![s.x,s.y,s.time,target?.x,target?.y].every(Number.isFinite)){reset(s);return false;}
  const t=performance.now(),previous=timers.get(s);
  if(!previous||previous.zone!==s.zone||s.time<previous.simTime||t-previous.at>1800){
   timers.set(s,{zone:s.zone,simTime:s.time,at:t,started:t,progressAt:t,x:s.x,y:s.y,attemptAt:null,repathAt:null});return false;
  }
  previous.simTime=s.time;previous.at=t;
  if(Math.hypot(s.x-previous.x,s.y-previous.y)>=.12){previous.progressAt=t;previous.x=s.x;previous.y=s.y;}
  if(t-previous.started<AUTO_MS)return false;
  const radius=Math.min(profile?2.4:2.5,Number.isFinite(plan.radius)?plan.radius:2.4);
  const near=radius>0&&Math.hypot(s.x-target.x,s.y-target.y)<=radius&&plan.action==='interact';
  if(!near){
   if(t-previous.progressAt>=STALL_MS&&(previous.repathAt===null||t-previous.repathAt>=RETRY_MS)&&s.target?.autoProgressV31301===true){
    // The ordinary driver replans via gi/yt on the same tick. No position,
    // cooldown, health, objective or manual-navigation state is altered.
    s.target=null;s.path=[];previous.repathAt=t;previous.progressAt=t;stats.repaths++;
   }
   return false;
  }
  if(typeof interact!=='function')return false;
  if(previous.attemptAt!==null&&t-previous.attemptAt<900)return false;
  previous.attemptAt=t;
  if(profile){
   const started=flow.transition(s,()=>interact(),false,false);
   if(started)stats.nearInteractions++;
   return started===true;
  }
  interact();stats.nearInteractions++;return true;
 }
 window.__HAPIL_AUTO_MAP_ADVANCE_RC115__=Object.freeze({version:'RC122',step,reset,metrics:()=>({tracked:'weak-map',delayMs:AUTO_MS,stallMs:STALL_MS,...stats})});
})();
